"""
Local speech-to-text microservice for Articulate.

Wraps faster-whisper (an open-source, CTranslate2-based reimplementation of
OpenAI's Whisper) behind a tiny HTTP API so the Node backend never needs a
paid STT API key. The model is loaded once at startup and reused across
requests. Runs on CPU by default (int8 quantization) so it works out of the
box on a laptop with no GPU.
"""

import os
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from faster_whisper import WhisperModel

MODEL_SIZE = os.environ.get("WHISPER_MODEL_SIZE", "base")
DEVICE = os.environ.get("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.environ.get("WHISPER_COMPUTE_TYPE", "int8")

app = FastAPI(title="Articulate STT Service")

model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_SIZE, "device": DEVICE}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    if not file.filename and not file.content_type:
        raise HTTPException(status_code=400, detail="No audio file provided")

    suffix = os.path.splitext(file.filename or "")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # language is pinned to English (this product targets English-language
        # SDE interview prep) which also sidesteps a faster-whisper bug where
        # auto language-detection crashes on near-silent/non-speech audio.
        segments_iter, info = model.transcribe(
            tmp_path, beam_size=5, vad_filter=True, language="en"
        )
        segments = [
            {"start": seg.start, "end": seg.end, "text": seg.text.strip()}
            for seg in segments_iter
        ]
        full_text = " ".join(s["text"] for s in segments).strip()

        return {
            "text": full_text,
            "duration": info.duration,
            "language": info.language,
            "segments": segments,
        }
    finally:
        os.remove(tmp_path)
