import { CodeScore, CommunicationScore, TranscriptMetrics } from "../types";

function ScoreBar(props: { label: string; value: number; colorClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{props.label}</span>
        <span className="font-semibold">{props.value}/10</span>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200">
        <div
          className={`h-1.5 rounded-full ${props.colorClass}`}
          style={{ width: `${props.value * 10}%` }}
        />
      </div>
    </div>
  );
}

export function CodeScoreCard({ score }: { score: CodeScore }) {
  return (
    <div className="rounded-xl border border-code-500/30 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-code-700">Your Code</h3>
        <span className="text-3xl font-bold text-code-700">{score.overall}/10</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{score.raw.summary}</p>

      <div className="mt-4 flex gap-2 text-xs">
        <span className="rounded-full bg-code-50 px-2 py-1 font-mono text-code-700">
          Time {score.timeComplexity}
        </span>
        <span className="rounded-full bg-code-50 px-2 py-1 font-mono text-code-700">
          Space {score.spaceComplexity}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <ScoreBar label="Correctness" value={score.correctness} colorClass="bg-code-600" />
        <ScoreBar label="Edge case coverage" value={score.edgeCaseCoverage} colorClass="bg-code-600" />
        <ScoreBar label="Code quality" value={score.codeQuality} colorClass="bg-code-600" />
      </div>

      {score.raw.edge_cases_missed?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Edge cases missed
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
            {score.raw.edge_cases_missed.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">{score.rationale}</p>
    </div>
  );
}

export function CommunicationScoreCard({
  score,
  metrics,
}: {
  score: CommunicationScore;
  metrics: TranscriptMetrics | null;
}) {
  return (
    <div className="rounded-xl border border-comm-500/30 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-comm-700">Your Explanation</h3>
        <span className="text-3xl font-bold text-comm-700">{score.overall}/10</span>
      </div>
      <p className="mt-2 text-sm text-slate-700">{score.raw.summary}</p>

      {metrics && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md bg-comm-50 p-2">
            <p className="font-bold text-comm-700">{Math.round(metrics.wordsPerMinute)}</p>
            <p className="text-slate-500">words/min</p>
          </div>
          <div className="rounded-md bg-comm-50 p-2">
            <p className="font-bold text-comm-700">{metrics.fillerCount}</p>
            <p className="text-slate-500">filler words</p>
          </div>
          <div className="rounded-md bg-comm-50 p-2">
            <p className="font-bold text-comm-700">
              {metrics.longestPauseMs != null ? `${(metrics.longestPauseMs / 1000).toFixed(1)}s` : "—"}
            </p>
            <p className="text-slate-500">longest pause</p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        <ScoreBar label="Structure" value={score.structure} colorClass="bg-comm-600" />
        <ScoreBar label="Clarity" value={score.clarity} colorClass="bg-comm-600" />
        <ScoreBar label="Confidence" value={score.confidence} colorClass="bg-comm-600" />
        <ScoreBar label="Completeness" value={score.completeness} colorClass="bg-comm-600" />
        <ScoreBar label="Pacing" value={score.pacing} colorClass="bg-comm-600" />
      </div>

      {score.tips?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Improvement tips
          </p>
          <ul className="mt-2 space-y-2">
            {score.tips.map((t, i) => (
              <li key={i} className="rounded-md bg-comm-50 p-2 text-sm">
                <p className="text-slate-800">{t.tip}</p>
                <p className="mt-1 font-mono text-xs italic text-slate-500">"{t.quote}"</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
