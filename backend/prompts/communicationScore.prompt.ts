/**
 * Communication Score Prompt
 * ---------------------------
 * This is the second of two independently-prompted scoring calls. This one
 * ONLY looks at the transcript of the candidate's spoken explanation (plus the
 * problem statement, so it can judge whether they covered the right ground)
 * and a set of deterministic transcript metrics computed in code
 * (backend/src/services/transcriptMetrics.ts). It is never shown the
 * candidate's actual code — the code-correctness call is a separate prompt
 * (codeCorrectness.prompt.ts) so the two scores stay clearly decoupled.
 *
 * The deterministic metrics (words-per-minute, filler-word density, longest
 * pause) are injected into the user message so the LLM's qualitative judgment
 * is grounded in real numbers instead of vibes, and so the model's `pacing`
 * and `confidence` reasoning should reference them directly rather than
 * re-estimating them from scratch.
 */

export const COMMUNICATION_SYSTEM_PROMPT = `You are an expert technical-interview communication coach. You evaluate HOW a candidate explained their approach out loud, not whether their code is correct — you are never shown their code and must not guess at or penalize code correctness.

You are given the problem statement (so you know what a complete explanation should cover), a transcript of the candidate's spoken walkthrough, and deterministic speech metrics computed from the transcript (words-per-minute, filler-word counts, longest pause). Treat those metrics as ground truth about pacing and disfluency — use them to anchor your \`pacing\` and \`confidence\` scores and reference the actual numbers in your feedback rather than re-estimating pace from the text alone.

Grade against this rubric, each on a 1-10 integer scale:
- structure: Did they state their high-level approach BEFORE diving into implementation details? Is there a clear beginning (restate problem / approach), middle (walkthrough), end (complexity / wrap-up), rather than a stream-of-consciousness ramble?
- clarity: Do they explain in plain language a non-expert interviewer could follow, or do they lean on unexplained jargon and vague pronouns ("this part just does the thing")? Reward precise-but-accessible explanations.
- confidence: Does the delivery sound assured and fluent, or hedgy/hesitant/filler-heavy? Use the supplied filler-word density and pause data as primary evidence here — do not contradict them without strong textual reason.
- completeness: Did they verbally cover time/space complexity, key trade-offs, and at least one edge case — the things a strong candidate says out loud even though it's not in the code? Score low if these are entirely absent from the transcript.
- pacing: Is the words-per-minute in a good conversational range for a technical explanation (roughly 120-160 wpm is comfortable; much faster reads as rushed/anxious, much slower drags)? Use the supplied wpm number directly.

Then give:
- overall: 1-10 holistic score, usually close to the average of the five sub-scores but you may weight structure and completeness slightly higher since they matter most in real interviews.
- summary: 2-3 sentences written directly to the candidate ("You opened with...") giving the headline verdict.
- tips: an array of 3-5 concrete, actionable improvement tips. EACH tip must include a short \`quote\` field that is a verbatim excerpt copied directly from the transcript illustrating the issue (or, if pointing out something missing, quote the moment where it should have appeared). Never fabricate a quote — copy it exactly from the transcript provided. If the transcript is too short to find a relevant quote for a given tip, omit that tip rather than inventing one.

Be specific and cite the transcript directly (paraphrase what they said) rather than generic coaching platitudes. Be calibrated: reserve 9-10 for genuinely strong, structured, low-filler explanations that would impress a real interviewer, and don't be afraid to score low when the transcript is thin, rambling, or missing the basics.

You MUST respond by calling the \`submit_communication_review\` tool exactly once with your complete evaluation. Do not write any prose outside the tool call.`;

export function buildCommunicationUserMessage(params: {
  problemTitle: string;
  problemPrompt: string;
  transcript: string;
  metrics: {
    wordCount: number;
    durationSec: number;
    wordsPerMinute: number;
    fillerCount: number;
    fillerBreakdown: Record<string, number>;
    longestPauseMs: number | null;
  };
}): string {
  const { problemTitle, problemPrompt, transcript, metrics } = params;
  const fillerLine = Object.entries(metrics.fillerBreakdown)
    .filter(([, count]) => count > 0)
    .map(([word, count]) => `${word}: ${count}`)
    .join(", ") || "none detected";

  return [
    `## Problem the candidate was explaining: ${problemTitle}`,
    problemPrompt,
    `\n## Deterministic transcript metrics (treat as ground truth)`,
    `- Word count: ${metrics.wordCount}`,
    `- Duration: ${metrics.durationSec.toFixed(1)}s`,
    `- Words per minute: ${metrics.wordsPerMinute.toFixed(0)}`,
    `- Filler word count: ${metrics.fillerCount} (${fillerLine})`,
    metrics.longestPauseMs != null
      ? `- Longest pause between segments: ${(metrics.longestPauseMs / 1000).toFixed(1)}s`
      : `- Longest pause: not available (no segment timestamps for this transcript)`,
    `\n## Transcript of candidate's spoken explanation`,
    '"""',
    transcript,
    '"""',
    `\nEvaluate this explanation against the rubric and call the submit_communication_review tool.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Anthropic tool-use JSON schema — keep field names in sync with services/scoring.service.ts */
export const COMMUNICATION_TOOL = {
  name: "submit_communication_review",
  description: "Submit a structured communication-quality evaluation of a candidate's spoken explanation.",
  input_schema: {
    type: "object" as const,
    properties: {
      overall: { type: "integer", minimum: 1, maximum: 10 },
      structure: { type: "integer", minimum: 1, maximum: 10 },
      structure_feedback: { type: "string" },
      clarity: { type: "integer", minimum: 1, maximum: 10 },
      clarity_feedback: { type: "string" },
      confidence: { type: "integer", minimum: 1, maximum: 10 },
      confidence_feedback: { type: "string" },
      completeness: { type: "integer", minimum: 1, maximum: 10 },
      completeness_feedback: { type: "string" },
      pacing: { type: "integer", minimum: 1, maximum: 10 },
      pacing_feedback: { type: "string" },
      summary: { type: "string" },
      tips: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tip: { type: "string" },
            quote: { type: "string" },
          },
          required: ["tip", "quote"],
        },
      },
    },
    required: [
      "overall",
      "structure",
      "structure_feedback",
      "clarity",
      "clarity_feedback",
      "confidence",
      "confidence_feedback",
      "completeness",
      "completeness_feedback",
      "pacing",
      "pacing_feedback",
      "summary",
      "tips",
    ],
  },
};
