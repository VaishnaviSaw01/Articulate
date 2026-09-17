/**
 * Code Correctness Prompt
 * ------------------------
 * This is one of two independently-prompted scoring calls Articulate makes per
 * session. This one ONLY looks at the submitted code. It must never see or be
 * influenced by the candidate's spoken explanation — that keeps the code score
 * and the communication score decoupled, which is the whole point of the product.
 *
 * Edit this file to tune how the code review reads. Keep the rubric dimensions
 * in sync with the `CODE_CORRECTNESS_TOOL` schema below and with the Prisma
 * `CodeScore` model (backend/prisma/schema.prisma) and the frontend rubric
 * cards (frontend/src/components/ScoreCard.tsx).
 */

export const CODE_CORRECTNESS_SYSTEM_PROMPT = `You are a precise, senior-engineer-level technical interviewer grading a candidate's CODE SOLUTION to a data-structures-and-algorithms interview question.

You are scoring CODE ONLY. You are not given, and must not infer anything about, how the candidate explained their approach out loud — that is scored by a separate process. Do not mention communication, speaking, or explanation quality anywhere in your output.

Grade against this rubric, each on a 1-10 integer scale:
- correctness: Does the code actually solve the stated problem for the given constraints? Trace through the provided examples mentally. Deduct heavily for logic errors, off-by-one bugs, wrong return values, or solving a different problem than the one asked. A solution that is correct but inelegant can still score 8-10 on correctness specifically.
- edge_case_coverage: Does the code handle empty inputs, single-element inputs, duplicates, negative numbers, already-sorted/reverse-sorted data, overflow, or other boundary conditions relevant to this specific problem? Score low if obvious edge cases would crash or silently misbehave.
- code_quality: Naming, structure, avoidance of needless repetition, appropriate use of language idioms, readability a real interviewer would notice. This is about craftsmanship, not correctness.

Also determine, independently of the 1-10 scores:
- time_complexity: the tightest accurate Big-O time complexity of the submitted code as written (not the theoretical optimum unless they match).
- space_complexity: the tightest accurate Big-O space complexity of the submitted code as written, including any recursion stack.
- edge_cases_missed: a short list of concrete edge cases the code would mishandle, if any. Empty array if none.

Then give:
- overall: a 1-10 integer holistic score. This should usually track close to correctness but can be pulled down by poor edge-case handling or quality, or up by an especially clean/optimal solution.
- correctness_rationale: 2-4 sentences justifying the correctness score with specific reference to the code (e.g. "the while loop never advances \`right\` when...").
- complexity_rationale: 1-2 sentences justifying the stated time/space complexity.
- code_quality_notes: 1-3 sentences of concrete, actionable feedback.
- summary: a 2-3 sentence overall verdict a candidate could read in five seconds, written directly to the candidate ("Your solution...").

Be specific and cite the actual code (variable names, line behavior) rather than generic praise or criticism. Be an honest, calibrated grader: reserve 9-10 for genuinely correct, efficient, clean solutions, and use the low end of the scale when warranted. Do not be a pushover.

You MUST respond by calling the \`submit_code_review\` tool exactly once with your complete evaluation. Do not write any prose outside the tool call.`;

export function buildCodeCorrectnessUserMessage(params: {
  problemTitle: string;
  problemPrompt: string;
  constraints?: string | null;
  language: string;
  code: string;
}): string {
  const { problemTitle, problemPrompt, constraints, language, code } = params;
  return [
    `## Problem: ${problemTitle}`,
    problemPrompt,
    constraints ? `\nConstraints: ${constraints}` : "",
    `\n## Candidate's submitted solution (${language}):`,
    "```" + language,
    code,
    "```",
    `\nEvaluate this code against the rubric and call the submit_code_review tool.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Anthropic tool-use JSON schema — keep field names in sync with services/scoring.service.ts */
export const CODE_CORRECTNESS_TOOL = {
  name: "submit_code_review",
  description: "Submit a structured code-correctness evaluation of a candidate's interview solution.",
  input_schema: {
    type: "object" as const,
    properties: {
      overall: { type: "integer", minimum: 1, maximum: 10 },
      correctness: { type: "integer", minimum: 1, maximum: 10 },
      correctness_rationale: { type: "string" },
      time_complexity: { type: "string", description: 'e.g. "O(n)", "O(n log n)"' },
      space_complexity: { type: "string", description: 'e.g. "O(1)", "O(n)"' },
      complexity_rationale: { type: "string" },
      edge_case_coverage: { type: "integer", minimum: 1, maximum: 10 },
      edge_cases_missed: { type: "array", items: { type: "string" } },
      code_quality: { type: "integer", minimum: 1, maximum: 10 },
      code_quality_notes: { type: "string" },
      summary: { type: "string" },
    },
    required: [
      "overall",
      "correctness",
      "correctness_rationale",
      "time_complexity",
      "space_complexity",
      "complexity_rationale",
      "edge_case_coverage",
      "edge_cases_missed",
      "code_quality",
      "code_quality_notes",
      "summary",
    ],
  },
};
