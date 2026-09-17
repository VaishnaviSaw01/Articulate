import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { CodeScoreCard, CommunicationScoreCard } from "../components/ScoreCard";
import { Session } from "../types";

function Headline({ session }: { session: Session }) {
  const code = session.codeScore?.overall;
  const comm = session.communicationScore?.overall;
  if (code == null || comm == null) return null;

  const gap = code - comm;
  let takeaway = "Your code and explanation are well matched.";
  if (gap >= 3) takeaway = "Your code is solid, but your explanation is holding you back in an interview.";
  else if (gap <= -3) takeaway = "You explained it better than the code executes — tighten up the implementation.";

  return (
    <div className="rounded-xl bg-slate-900 p-6 text-white">
      <p className="text-sm uppercase tracking-wide text-slate-400">{session.problem.title}</p>
      <p className="mt-2 text-2xl font-bold">
        Your code: <span className="text-code-400">{code}/10</span>. Your explanation:{" "}
        <span className="text-comm-400">{comm}/10</span>.
      </p>
      <p className="mt-2 text-slate-300">{takeaway}</p>
    </div>
  );
}

export function Results() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function poll() {
      try {
        const { data } = await api.get(`/sessions/${id}`);
        if (cancelled) return;
        setSession(data.session);
        if (data.session.status !== "COMPLETED" && data.session.status !== "FAILED") {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        if (!cancelled) setError(apiErrorMessage(err));
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) return <p className="px-6 py-8 text-sm text-red-600">{error}</p>;
  if (!session) return <p className="px-6 py-8 text-sm text-slate-500">Loading results...</p>;

  const stillProcessing = session.status === "TRANSCRIBING" || session.status === "SCORING";

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Headline session={session} />

      {stillProcessing && (
        <p className="text-sm text-slate-500">
          Still working — transcribing and scoring your explanation...
        </p>
      )}
      {session.status === "FAILED" && (
        <p className="text-sm text-red-600">
          Something went wrong scoring this session. Check the backend logs and try again.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {session.codeScore ? (
          <CodeScoreCard score={session.codeScore} />
        ) : (
          <p className="text-sm text-slate-500">No code score yet.</p>
        )}
        {session.communicationScore ? (
          <CommunicationScoreCard
            score={session.communicationScore}
            metrics={session.transcriptMetrics}
          />
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-400">
            {stillProcessing ? "Scoring your explanation..." : "No recording submitted yet."}
          </div>
        )}
      </div>

      {session.transcript && (
        <details className="rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-700">
            View full transcript
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{session.transcript}</p>
        </details>
      )}

      <Link to="/" className="inline-block text-sm text-code-600 hover:underline">
        ← Back to problems
      </Link>
    </div>
  );
}
