import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { ProblemSummary } from "../types";

const DIFFICULTY_TEXT: Record<string, string> = {
  Easy: "text-green-600",
  Medium: "text-amber-600",
  Hard: "text-red-600",
};

export function ProblemList() {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    api
      .get("/problems")
      .then(({ data }) => setProblems(data.problems))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(problems.map((p) => p.category)))],
    [problems]
  );

  const visible =
    activeCategory === "All" ? problems : problems.filter((p) => p.category === activeCategory);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Problem Bank</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a problem, write your solution, then explain your approach out loud. We score both
        separately.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              activeCategory === c
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-sm text-slate-500">Loading problems...</p>}
      {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="w-12 px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="w-24 px-4 py-2 font-medium">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((p, i) => (
                <tr key={p.id} className="group">
                  <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="font-medium text-slate-800 group-hover:text-code-600 group-hover:underline"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className={`px-4 py-3 font-semibold ${DIFFICULTY_TEXT[p.difficulty] ?? "text-slate-600"}`}>
                    {p.difficulty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
