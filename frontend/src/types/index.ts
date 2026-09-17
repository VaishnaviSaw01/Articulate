export type ProblemSummary = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
};

export type ProblemDetail = ProblemSummary & {
  prompt: string;
  constraints: string | null;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: { javascript?: string; python?: string; java?: string };
};

export type CodeScore = {
  overall: number;
  correctness: number;
  timeComplexity: string;
  spaceComplexity: string;
  edgeCaseCoverage: number;
  codeQuality: number;
  rationale: string;
  raw: {
    correctness_rationale: string;
    complexity_rationale: string;
    code_quality_notes: string;
    edge_cases_missed: string[];
    summary: string;
  };
};

export type CommunicationTip = { tip: string; quote: string };

export type CommunicationScore = {
  overall: number;
  structure: number;
  clarity: number;
  confidence: number;
  completeness: number;
  pacing: number;
  tips: CommunicationTip[];
  raw: {
    structure_feedback: string;
    clarity_feedback: string;
    confidence_feedback: string;
    completeness_feedback: string;
    pacing_feedback: string;
    summary: string;
  };
};

export type TranscriptMetrics = {
  wordCount: number;
  durationSec: number;
  wordsPerMinute: number;
  fillerCount: number;
  fillerBreakdown: Record<string, number>;
  longestPauseMs: number | null;
};

export type SessionStatus = "DRAFT" | "TRANSCRIBING" | "SCORING" | "COMPLETED" | "FAILED";

export type Session = {
  id: string;
  userId: string;
  problemId: string;
  language: string;
  code: string;
  audioPath: string | null;
  transcript: string | null;
  status: SessionStatus;
  isSeed: boolean;
  createdAt: string;
  updatedAt: string;
  problem: ProblemDetail;
  codeScore: CodeScore | null;
  communicationScore: CommunicationScore | null;
  transcriptMetrics: TranscriptMetrics | null;
};

export type AuthUser = { id: string; email: string };
