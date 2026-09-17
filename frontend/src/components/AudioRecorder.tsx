import { useEffect, useRef, useState } from "react";

const MAX_SECONDS = 210; // 3.5 minutes hard cap; the ask is for a 1-3 minute explanation

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioRecorder(props: {
  onRecordingComplete: (blob: Blob) => void;
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "recording" | "recorded">("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        props.onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setStatus("recording");
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
          }
          return s + 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        "Couldn't access your microphone. Check your browser permissions and try again."
      );
    }
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setStatus("recorded");
  }

  function reRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setStatus("idle");
  }

  const approachingLimit = seconds > 150;

  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Explain your approach</p>
          <p className="text-xs text-slate-500">
            Talk through it like you would to an interviewer: approach first, then trade-offs and
            complexity. Aim for 1-3 minutes.
          </p>
        </div>
        {status !== "idle" && (
          <span className={`font-mono text-sm ${approachingLimit ? "text-amber-600" : "text-slate-600"}`}>
            {formatTime(seconds)}
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        {status === "idle" && (
          <button
            type="button"
            disabled={props.disabled}
            onClick={startRecording}
            className="rounded-md bg-comm-600 px-4 py-2 text-sm font-semibold text-white hover:bg-comm-700 disabled:opacity-50"
          >
            Start recording
          </button>
        )}
        {status === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Stop recording
          </button>
        )}
        {status === "recorded" && (
          <>
            <audio controls src={audioUrl ?? undefined} className="h-9" />
            <button
              type="button"
              onClick={reRecord}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Re-record
            </button>
          </>
        )}
      </div>
    </div>
  );
}
