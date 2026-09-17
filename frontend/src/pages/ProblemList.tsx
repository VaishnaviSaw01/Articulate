import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { ProblemSummary } from "../types";

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

export function ProblemList() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/problems")
      .then(({ data }) => setProblems(data.problems))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const grouped = problems.reduce<Record<string, ProblemSummary[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Problem Bank</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a problem, write your solution, then explain your approach out loud. We score both
        separately.
      </p>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading problems...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {category}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((p) => (
              <Link
                key={p.id}
                to={`/problems/${p.slug}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-code-500 hover:shadow"
              >
                <span className="font-medium text-slate-800">{p.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${DIFFICULTY_STYLES[p.difficulty] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {p.difficulty}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
