import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { PROBLEMS } from "./problems";
import { SAMPLE_SESSIONS } from "./sampleSessions";
import { computeTranscriptMetrics } from "../services/transcriptMetrics";

const DEMO_EMAIL = "demo@articulate.dev";
const DEMO_PASSWORD = "demo12345";

async function seedProblems() {
  for (const p of PROBLEMS) {
    await prisma.problem.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        prompt: p.prompt,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
      },
      update: {
        title: p.title,
        category: p.category,
        difficulty: p.difficulty,
        prompt: p.prompt,
        constraints: p.constraints,
        examples: p.examples,
        starterCode: p.starterCode,
      },
    });
  }
  console.log(`Seeded ${PROBLEMS.length} problems.`);
}

async function seedDemoSessions() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: { email: DEMO_EMAIL, passwordHash },
    update: {},
  });

  const existingSeedCount = await prisma.session.count({
    where: { userId: demoUser.id, isSeed: true },
  });
  if (existingSeedCount > 0) {
    console.log("Demo sessions already seeded, skipping.");
    return;
  }

  for (const sample of SAMPLE_SESSIONS) {
    const problem = await prisma.problem.findUnique({ where: { slug: sample.problemSlug } });
    if (!problem) throw new Error(`Unknown problem slug in sample data: ${sample.problemSlug}`);

    const metrics = computeTranscriptMetrics({
      transcript: sample.transcript,
      durationSec: sample.durationSec,
      segments: null,
    });

    const session = await prisma.session.create({
      data: {
        userId: demoUser.id,
        problemId: problem.id,
        language: sample.language,
        code: sample.code,
        transcript: sample.transcript,
        status: "COMPLETED",
        isSeed: true,
      },
    });

    await prisma.codeScore.create({
      data: {
        sessionId: session.id,
        overall: sample.codeReview.overall,
        correctness: sample.codeReview.correctness,
        timeComplexity: sample.codeReview.time_complexity,
        spaceComplexity: sample.codeReview.space_complexity,
        edgeCaseCoverage: sample.codeReview.edge_case_coverage,
        codeQuality: sample.codeReview.code_quality,
        rationale: [
          sample.codeReview.correctness_rationale,
          sample.codeReview.complexity_rationale,
          sample.codeReview.code_quality_notes,
        ].join(" "),
        raw: sample.codeReview as object,
      },
    });

    await prisma.communicationScore.create({
      data: {
        sessionId: session.id,
        overall: sample.communicationReview.overall,
        structure: sample.communicationReview.structure,
        clarity: sample.communicationReview.clarity,
        confidence: sample.communicationReview.confidence,
        completeness: sample.communicationReview.completeness,
        pacing: sample.communicationReview.pacing,
        tips: sample.communicationReview.tips as object,
        raw: sample.communicationReview as object,
      },
    });

    await prisma.transcriptMetrics.create({
      data: {
        sessionId: session.id,
        wordCount: metrics.wordCount,
        durationSec: metrics.durationSec,
        wordsPerMinute: metrics.wordsPerMinute,
        fillerCount: metrics.fillerCount,
        fillerBreakdown: metrics.fillerBreakdown as object,
        longestPauseMs: metrics.longestPauseMs,
      },
    });
  }

  console.log(
    `Seeded ${SAMPLE_SESSIONS.length} demo sessions for ${DEMO_EMAIL} (password: ${DEMO_PASSWORD}).`
  );
}

async function main() {
  await seedProblems();
  await seedDemoSessions();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
