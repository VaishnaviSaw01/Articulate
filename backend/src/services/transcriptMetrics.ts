/**
 * Deterministic transcript analysis. These numbers are computed in plain code
 * (no LLM involved) and are injected into the communication-scoring prompt as
 * ground truth — see prompts/communicationScore.prompt.ts. The point is to
 * give the LLM's qualitative "confidence" and "pacing" scores something
 * concrete to anchor to, rather than relying purely on its own read of the
 * text.
 */

export type TranscriptSegment = {
  text: string;
  start: number; // seconds
  end: number; // seconds
};

export type TranscriptMetricsResult = {
  wordCount: number;
  durationSec: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillerBreakdown: Record<string, number>;
  longestPauseMs: number | null;
};

// Deliberately simple, explainable filler-word list (word-boundary matched).
// "so", "like", and "right" are legitimate words too — this is a heuristic
// signal to accompany the LLM's judgment, not a precise linguistic model.
const FILLER_PATTERNS: Record<string, RegExp> = {
  um: /\bumm?\b/gi,
  uh: /\buhh?\b/gi,
  like: /\blike\b/gi,
  so: /\bso\b/gi,
  basically: /\bbasically\b/gi,
  "you know": /\byou know\b/gi,
  actually: /\bactually\b/gi,
};

export function countWords(transcript: string): number {
  const trimmed = transcript.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countFillers(transcript: string): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;
  for (const [label, pattern] of Object.entries(FILLER_PATTERNS)) {
    const matches = transcript.match(pattern);
    const count = matches ? matches.length : 0;
    breakdown[label] = count;
    total += count;
  }
  return { total, breakdown };
}

export function longestPauseMs(segments: TranscriptSegment[] | null | undefined): number | null {
  if (!segments || segments.length < 2) return null;
  let longest = 0;
  for (let i = 1; i < segments.length; i++) {
    const gapSec = segments[i].start - segments[i - 1].end;
    if (gapSec > longest) longest = gapSec;
  }
  return Math.max(0, longest) * 1000;
}

export function computeTranscriptMetrics(params: {
  transcript: string;
  durationSec: number;
  segments?: TranscriptSegment[] | null;
}): TranscriptMetricsResult {
  const { transcript, durationSec, segments } = params;
  const wordCount = countWords(transcript);
  const { total: fillerCount, breakdown: fillerBreakdown } = countFillers(transcript);
  const minutes = durationSec > 0 ? durationSec / 60 : 0;
  const wordsPerMinute = minutes > 0 ? wordCount / minutes : 0;

  return {
    wordCount,
    durationSec,
    wordsPerMinute,
    fillerCount,
    fillerBreakdown,
    longestPauseMs: longestPauseMs(segments),
  };
}
