import fs from "node:fs";
import { env } from "../env";
import { TranscriptSegment } from "./transcriptMetrics";

export type TranscriptionResult = {
  text: string;
  durationSec: number;
  segments: TranscriptSegment[];
};

/**
 * Sends an audio file to the local faster-whisper microservice (see
 * stt-service/) for transcription. Chosen over a hosted STT API so the app
 * has no per-transcription cost and needs no extra API key beyond Anthropic's
 * — see stt-service/README for how it runs.
 */
export async function transcribeAudio(filePath: string, mimeType: string): Promise<TranscriptionResult> {
  const fileBuffer = fs.readFileSync(filePath);
  const form = new FormData();
  form.append("file", new Blob([fileBuffer], { type: mimeType }), "audio");

  const response = await fetch(`${env.sttServiceUrl}/transcribe`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`STT service error (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    text: string;
    duration: number;
    segments: { start: number; end: number; text: string }[];
  };

  return {
    text: data.text,
    durationSec: data.duration,
    segments: data.segments,
  };
}
