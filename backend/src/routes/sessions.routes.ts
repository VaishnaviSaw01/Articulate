import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { z } from "zod";
import { prisma } from "../db";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { scoreCodeCorrectness, scoreCommunication } from "../services/scoring.service";
import { transcribeAudio } from "../services/transcription.service";
import { computeTranscriptMetrics } from "../services/transcriptMetrics";

export const sessionsRouter = Router();
sessionsRouter.use(requireAuth);

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".webm";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

const sessionInclude = {
  problem: true,
  codeScore: true,
  communicationScore: true,
  transcriptMetrics: true,
} as const;

const createSessionSchema = z.object({
  problemId: z.string().min(1),
  language: z.enum(["javascript", "python", "java"]),
  code: z.string().min(1, "Code cannot be empty"),
});

// Create a session and immediately run the code-correctness scoring call.
// This is the "one working LLM call end-to-end" path — no audio required yet.
sessionsRouter.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    }
    const { problemId, language, code } = parsed.data;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const session = await prisma.session.create({
      data: { userId: req.userId!, problemId, language, code, status: "SCORING" },
    });

    // Code scoring is best-effort here: if it fails (e.g. no ANTHROPIC_API_KEY
    // configured yet), the session still exists and the candidate can move on
    // to recording their explanation — that flow must never be blocked by the
    // code-scoring call failing.
    let codeScoringError: string | null = null;
    try {
      const review = await scoreCodeCorrectness({
        problemTitle: problem.title,
        problemPrompt: problem.prompt,
        constraints: problem.constraints,
        language,
        code,
      });

      await prisma.codeScore.create({
        data: {
          sessionId: session.id,
          overall: review.overall,
          correctness: review.correctness,
          timeComplexity: review.time_complexity,
          spaceComplexity: review.space_complexity,
          edgeCaseCoverage: review.edge_case_coverage,
          codeQuality: review.code_quality,
          rationale: [review.correctness_rationale, review.complexity_rationale, review.code_quality_notes]
            .filter(Boolean)
            .join(" "),
          raw: review as object,
        },
      });
    } catch (err) {
      codeScoringError = err instanceof Error ? err.message : "Code scoring failed";
      console.error(`Code scoring failed for session ${session.id}:`, err);
    }

    await prisma.session.update({ where: { id: session.id }, data: { status: "DRAFT" } });

    const full = await prisma.session.findUnique({ where: { id: session.id }, include: sessionInclude });
    res.status(201).json({ session: full, codeScoringError });
  })
);

sessionsRouter.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res) => {
    const sessions = await prisma.session.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: "desc" },
      include: sessionInclude,
    });
    res.json({ sessions });
  })
);

sessionsRouter.get(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res) => {
    const session = await prisma.session.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: sessionInclude,
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  })
);

// Upload the spoken-explanation recording, transcribe it, compute deterministic
// metrics, then run the independent communication-scoring LLM call.
sessionsRouter.post(
  "/:id/audio",
  upload.single("audio"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const session = await prisma.session.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: { problem: true },
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded (field name: audio)" });

    await prisma.session.update({
      where: { id: session.id },
      data: { status: "TRANSCRIBING", audioPath: req.file.path },
    });

    // Transcription failing IS fatal (there's nothing to show without it).
    // Communication scoring failing after a successful transcription is not:
    // the transcript and deterministic metrics are still valuable on their
    // own, so we save them and let the communication score be null rather
    // than throwing the whole upload away.
    let transcription: Awaited<ReturnType<typeof transcribeAudio>>;
    try {
      transcription = await transcribeAudio(req.file.path, req.file.mimetype);
    } catch (err) {
      await prisma.session.update({ where: { id: session.id }, data: { status: "FAILED" } });
      throw err;
    }

    const metrics = computeTranscriptMetrics({
      transcript: transcription.text,
      durationSec: transcription.durationSec,
      segments: transcription.segments,
    });

    await prisma.session.update({
      where: { id: session.id },
      data: {
        transcript: transcription.text,
        segments: transcription.segments as object,
        status: "SCORING",
      },
    });

    await prisma.transcriptMetrics.upsert({
      where: { sessionId: session.id },
      create: {
        sessionId: session.id,
        wordCount: metrics.wordCount,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        fillerBreakdown: metrics.fillerBreakdown as object,
        longestPauseMs: metrics.longestPauseMs,
      },
      update: {
        wordCount: metrics.wordCount,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        fillerBreakdown: metrics.fillerBreakdown as object,
        longestPauseMs: metrics.longestPauseMs,
      },
    });

    let communicationScoringError: string | null = null;
    try {
      const review = await scoreCommunication({
        problemTitle: session.problem.title,
        problemPrompt: session.problem.prompt,
        transcript: transcription.text,
        metrics,
      });

      await prisma.communicationScore.upsert({
        where: { sessionId: session.id },
        create: {
          sessionId: session.id,
          overall: review.overall,
          structure: review.structure,
          clarity: review.clarity,
          confidence: review.confidence,
          completeness: review.completeness,
          pacing: review.pacing,
          tips: review.tips as object,
          raw: review as object,
        },
        update: {
          overall: review.overall,
          structure: review.structure,
          clarity: review.clarity,
          confidence: review.confidence,
          completeness: review.completeness,
          pacing: review.pacing,
          tips: review.tips as object,
          raw: review as object,
        },
      });
    } catch (err) {
      communicationScoringError = err instanceof Error ? err.message : "Communication scoring failed";
      console.error(`Communication scoring failed for session ${session.id}:`, err);
    }

    await prisma.session.update({ where: { id: session.id }, data: { status: "COMPLETED" } });

    const full = await prisma.session.findUnique({ where: { id: session.id }, include: sessionInclude });
    res.json({ session: full, communicationScoringError });
  })
);
