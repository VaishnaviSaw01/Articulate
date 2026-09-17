import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, apiErrorMessage } from "../api/client";
import { CodeEditor } from "../components/CodeEditor";
import { AudioRecorder } from "../components/AudioRecorder";
import { ProblemDetail, Session } from "../types";

type Language = "javascript" | "python" | "java";

export function Workspace() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submittingCode, setSubmittingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

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
    try {
      const { data } = await api.post("/sessions", { problemId: problem.id, language, code });
      setSession(data.session);
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

  if (loadError) return <p className="text-sm text-red-600">{loadError}</p>;
  if (!problem) return <p className="text-sm text-slate-500">Loading problem...</p>;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-slate-900">{problem.title}</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {problem.difficulty}
          </span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {problem.prompt}
        </p>
        {problem.constraints && (
          <p className="mt-3 text-xs text-slate-500">
            <span className="font-semibold">Constraints:</span> {problem.constraints}
          </p>
        )}
        <div className="mt-4 space-y-2">
          {problem.examples.map((ex, i) => (
            <div key={i} className="rounded-md bg-slate-100 p-3 font-mono text-xs">
              <div>
                <span className="text-slate-500">Input:</span> {ex.input}
              </div>
              <div>
                <span className="text-slate-500">Output:</span> {ex.output}
              </div>
              {ex.explanation && (
                <div className="text-slate-500">{ex.explanation}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <select
            value={language}
            disabled={!!session}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:opacity-50"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <div className="mt-2">
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>

        {codeError && <p className="mt-2 text-sm text-red-600">{codeError}</p>}

        {!session && (
          <button
            onClick={submitCode}
            disabled={submittingCode || !code.trim()}
            className="mt-3 w-full rounded-md bg-code-600 px-4 py-2 text-sm font-semibold text-white hover:bg-code-700 disabled:opacity-50"
          >
            {submittingCode ? "Scoring your code with Claude..." : "Submit code for review"}
          </button>
        )}

        {session && session.codeScore && (
          <div className="mt-4 rounded-lg border border-code-500/30 bg-code-50 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-code-700">Code score</p>
              <p className="text-2xl font-bold text-code-700">{session.codeScore.overall}/10</p>
            </div>
            <p className="mt-1 text-sm text-slate-700">{session.codeScore.raw.summary}</p>
          </div>
        )}

        {session && (
          <div className="mt-4">
            <AudioRecorder onRecordingComplete={handleRecordingComplete} disabled={uploadingAudio} />
            {uploadingAudio && (
              <p className="mt-2 text-sm text-slate-500">
                Transcribing and scoring your explanation — this can take a bit...
              </p>
            )}
            {audioError && <p className="mt-2 text-sm text-red-600">{audioError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
