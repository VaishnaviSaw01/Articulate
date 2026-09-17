import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { TrendChart } from "../components/TrendChart";
import { Session } from "../types";

export function History() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/sessions")
      .then(({ data }) => setSessions(data.sessions))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const scoredCount = sessions.filter((s) => s.communicationScore).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Your History</h1>
      <p className="mt-1 text-sm text-slate-500">
        Track how your communication score trends across sessions.
      </p>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && scoredCount >= 2 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <TrendChart sessions={sessions} />
        </div>
      )}
      {!loading && scoredCount > 0 && scoredCount < 2 && (
        <p className="mt-6 text-sm text-slate-400">
          Complete at least 2 scored sessions to see your trend line.
        </p>
      )}

      <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {sessions.map((s) => (
          <Link
            key={s.id}
            to={`/sessions/${s.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-800">{s.problem.title}</p>
              <p className="text-xs text-slate-500">
                {new Date(s.createdAt).toLocaleString()} · {s.status}
              </p>
            </div>
            <div className="flex gap-4 text-sm font-semibold">
              <span className="text-code-600">{s.codeScore ? `${s.codeScore.overall}/10` : "—"}</span>
              <span className="text-comm-600">
                {s.communicationScore ? `${s.communicationScore.overall}/10` : "—"}
              </span>
            </div>
          </Link>
        ))}
        {!loading && sessions.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            No sessions yet. <Link to="/" className="text-code-600 hover:underline">Pick a problem</Link> to get started.
          </p>
        )}
      </div>
    </div>
  );
}
