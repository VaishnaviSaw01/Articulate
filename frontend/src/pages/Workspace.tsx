import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { CodeEditor } from "../components/CodeEditor";
import { AudioRecorder } from "../components/AudioRecorder";
import { ProblemDetail, Session } from "../types";

type Language = "javascript" | "python" | "java";

const DIFFICULTY_TEXT: Record<string, string> = {
  Easy: "text-green-600",
  Medium: "text-amber-600",
  Hard: "text-red-600",
};

export function Workspace() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeScoringError, setCodeScoringError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"review" | "explain">("review");

  useEffect(() => {
    if (!slug) return;
    api
      .get(`/problems/${slug}`)
      .then(({ data }) => {
        setProblem(data.problem);
        setCode(data.problem.starterCode?.javascript ?? "");
      })
      .catch((err) => setLoadError(apiErrorMessage(err)));
  }, [slug]);

  function handleLanguageChange(next: Language) {
    setLanguage(next);
    if (problem) {
      const starter = problem.starterCode?.[next];
      if (starter) setCode(starter);
    }
  }

  async function submitCode() {
    if (!problem) return;
    setSubmittingCode(true);
    setCodeError(null);
    setCodeScoringError(null);
    try {
      const { data } = await api.post("/sessions", { problemId: problem.id, language, code });
      setSession(data.session);
      setCodeScoringError(data.codeScoringError ?? null);
      // The recording step is the whole point of this app — jump straight to it.
      setActiveTab("explain");
    } catch (err) {
      setCodeError(apiErrorMessage(err));
    } finally {
      setSubmittingCode(false);
    }
  }

  async function handleRecordingComplete(blob: Blob) {
    if (!session) return;
    setUploadingAudio(true);
    setAudioError(null);
    try {
      const form = new FormData();
      form.append("audio", blob, "explanation.webm");
      const { data } = await api.post(`/sessions/${session.id}/audio`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate(`/sessions/${data.session.id}`);
    } catch (err) {
      setAudioError(apiErrorMessage(err));
    } finally {
      setUploadingAudio(false);
    }
  }

  if (loadError) return <p className="px-6 py-8 text-sm text-red-600">{loadError}</p>;
  if (!problem) return <p className="px-6 py-8 text-sm text-slate-500">Loading problem...</p>;

  return (
    <div className="flex h-full min-h-0">
      {/* Left: problem description */}
      <div className="flex w-[40%] min-w-[340px] flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-2.5">
          <Link to="/" className="text-xs font-medium text-slate-400 hover:text-slate-600">
            ← Problems
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">{problem.title}</h1>
            <span className={`text-xs font-semibold ${DIFFICULTY_TEXT[problem.difficulty] ?? "text-slate-500"}`}>
              {problem.difficulty}
            </span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {problem.category}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {problem.prompt}
          </p>

          {problem.constraints && (
            <p className="mt-4 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Constraints:</span> {problem.constraints}
            </p>
          )}

          <div className="mt-5 space-y-3">
            {problem.examples.map((ex, i) => (
              <div key={i} className="rounded-md border border-slate-200 bg-slate-50 p-3 font-mono text-xs">
                <div className="text-slate-500">
                  Example {i + 1}
                </div>
                <div className="mt-1">
                  <span className="text-slate-500">Input:</span> {ex.input}
                </div>
                <div>
                  <span className="text-slate-500">Output:</span> {ex.output}
                </div>
                {ex.explanation && <div className="mt-1 text-slate-500">{ex.explanation}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: editor + bottom drawer */}
      <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
          <select
            value={language}
            disabled={!!session}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>

          {!session ? (
            <button
              onClick={submitCode}
              disabled={submittingCode || !code.trim()}
              className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {submittingCode ? "Scoring with Claude..." : "Submit"}
            </button>
          ) : (
            <span className="text-xs font-medium text-slate-400">Code submitted</span>
          )}
        </div>

        <div className="min-h-0 flex-[1.3] border-b border-slate-200">
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>

        {codeError && (
          <p className="border-b border-slate-200 bg-red-50 px-4 py-2 text-sm text-red-600">
            {codeError}
          </p>
        )}

        {/* Bottom drawer */}
        <div className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex border-b border-slate-200 text-sm">
            <button
              onClick={() => setActiveTab("review")}
              className={`px-4 py-2 font-medium ${
                activeTab === "review"
                  ? "border-b-2 border-code-600 text-code-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Code Review
            </button>
            <button
              onClick={() => setActiveTab("explain")}
              disabled={!session}
              className={`flex items-center gap-1.5 px-4 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                activeTab === "explain"
                  ? "border-b-2 border-comm-600 text-comm-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              🎤 Explain Your Approach
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {activeTab === "review" && (
              <>
                {!session && (
                  <p className="text-sm text-slate-400">
                    Submit your code to get an instant correctness review from Claude.
                  </p>
                )}
                {session && codeScoringError && (
                  <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-700">
                    Code scoring is unavailable right now ({codeScoringError}). You can still
                    record your explanation below — the communication score doesn't depend on this.
                  </p>
                )}
                {session && session.codeScore && (
                  <div className="rounded-lg border border-code-500/30 bg-code-50 p-4">
                    <div className="flex items-baseline justify-between">
                      <p className="text-sm font-semibold text-code-700">Code score</p>
                      <p className="text-2xl font-bold text-code-700">{session.codeScore.overall}/10</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{session.codeScore.raw.summary}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === "explain" && (
              <>
                {!session ? (
                  <p className="text-sm text-slate-400">Submit your code first, then record your explanation here.</p>
                ) : (
                  <div>
                    <div className="mb-3 rounded-md border border-comm-500/30 bg-comm-50 px-3 py-2 text-xs text-comm-700">
                      This is the whole point of Articulate: a real interviewer grades how you talk
                      through your solution, not just whether it runs. Record a 1-3 minute
                      walkthrough like you would in an interview.
                    </div>
                    <AudioRecorder onRecordingComplete={handleRecordingComplete} disabled={uploadingAudio} />
                    {uploadingAudio && (
                      <p className="mt-2 text-sm text-slate-500">
                        Transcribing and scoring your explanation — this can take a bit...
                      </p>
                    )}
                    {audioError && <p className="mt-2 text-sm text-red-600">{audioError}</p>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
