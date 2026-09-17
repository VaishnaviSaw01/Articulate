import {
  CODE_CORRECTNESS_SYSTEM_PROMPT,
  CODE_CORRECTNESS_TOOL,
  buildCodeCorrectnessUserMessage,
} from "../../prompts/codeCorrectness.prompt";
import {
  COMMUNICATION_SYSTEM_PROMPT,
  COMMUNICATION_TOOL,
  buildCommunicationUserMessage,
} from "../../prompts/communicationScore.prompt";
import { callClaudeWithTool } from "./anthropic.service";
import { TranscriptMetricsResult } from "./transcriptMetrics";

export type CodeReviewResult = {
  overall: number;
  correctness: number;
  correctness_rationale: string;
  time_complexity: string;
  space_complexity: string;
  complexity_rationale: string;
  edge_case_coverage: number;
  edge_cases_missed: string[];
  code_quality: number;
  code_quality_notes: string;
  summary: string;
};

export type CommunicationReviewResult = {
  overall: number;
  structure: number;
  structure_feedback: string;
  clarity: number;
  clarity_feedback: string;
  confidence: number;
  confidence_feedback: string;
  completeness: number;
  completeness_feedback: string;
  pacing: number;
  pacing_feedback: string;
  summary: string;
  tips: { tip: string; quote: string }[];
};

/** Scores CODE ONLY. Never receives the transcript — see prompts/codeCorrectness.prompt.ts */
export async function scoreCodeCorrectness(params: {
  problemTitle: string;
  problemPrompt: string;
  constraints?: string | null;
  language: string;
  code: string;
}): Promise<CodeReviewResult> {
  const userMessage = buildCodeCorrectnessUserMessage(params);
  return callClaudeWithTool<CodeReviewResult>({
    system: CODE_CORRECTNESS_SYSTEM_PROMPT,
    userMessage,
    tool: CODE_CORRECTNESS_TOOL,
  });
}

/** Scores the SPOKEN EXPLANATION ONLY. Never receives the code — see prompts/communicationScore.prompt.ts */
export async function scoreCommunication(params: {
  problemTitle: string;
  problemPrompt: string;
  transcript: string;
  metrics: TranscriptMetricsResult;
}): Promise<CommunicationReviewResult> {
  const userMessage = buildCommunicationUserMessage(params);
  return callClaudeWithTool<CommunicationReviewResult>({
    system: COMMUNICATION_SYSTEM_PROMPT,
    userMessage,
    tool: COMMUNICATION_TOOL,
  });
}
