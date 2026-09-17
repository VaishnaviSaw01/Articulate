# Articulate

**LeetCode grades your code. It never listens to you explain it — and in a real interview, that's half the score.**

Articulate is a practice tool for CS students prepping for SDE interviews. You solve a problem like normal, but then you also record yourself explaining your approach out loud — the "walk me through your solution" part every real interview has. The app grades your code and your explanation **separately, with two independent Claude calls**, so you get a clear answer to a question LeetCode-style tools can't: *is my code the problem, or is it how I talk about it?*

```
Your code: 9/10.  Your explanation: 4/10.
Your code is solid, but your explanation is holding you back in an interview.
```

That contrast is the entire product.

## Why two separate calls

It would be easy to ask one LLM call to "grade this code and this explanation" — but then a great explanation could paper over broken code, or vice versa, and you'd never know which one to actually fix. Instead:

- **Code correctness** ([`backend/prompts/codeCorrectness.prompt.ts`](backend/prompts/codeCorrectness.prompt.ts)) sees only the submitted code and the problem statement. It never sees the transcript.
- **Communication quality** ([`backend/prompts/communicationScore.prompt.ts`](backend/prompts/communicationScore.prompt.ts)) sees only the transcript, the problem statement, and deterministic speech metrics. It never sees the code.

Both prompts use Claude's tool-use (structured JSON output), so the frontend renders consistent rubric cards instead of parsing free text. See [How scoring works](frontend/src/pages/Rubric.tsx) in the app itself for the full rubric.

### Deterministic grounding

Before the transcript reaches Claude, [`transcriptMetrics.ts`](backend/src/services/transcriptMetrics.ts) computes, in plain code:

- **Words per minute**
- **Filler word density** ("um", "uh", "like", "so", "basically", "actually", "you know")
- **Longest pause** between transcript segments (when the STT engine returns word/segment timestamps)

These numbers are injected into the communication prompt as ground truth, so the qualitative score is anchored to something measurable instead of being a pure LLM guess.

## Architecture

```
articulate/
├── backend/          Express + TypeScript + Prisma (PostgreSQL)
│   ├── prompts/       The two scoring prompts — treated as first-class, versioned artifacts
│   └── src/
│       ├── routes/     auth, problems, sessions (code scoring, audio upload, communication scoring)
│       ├── services/   Anthropic wrapper, scoring, transcript metrics, STT client
│       └── data/       15-question seed bank + pre-scored demo sessions
├── frontend/         React + TypeScript + Vite + Tailwind + Monaco editor
├── stt-service/      Local speech-to-text microservice (faster-whisper), no external API key needed
└── docker-compose.yml
```

**Stack decisions:**

| Concern | Choice | Why |
|---|---|---|
| Backend | Node.js + Express | Matches the frontend's TypeScript types end-to-end |
| Database | **PostgreSQL** via Prisma | Chosen over SQLite for parity with the deploy target |
| Speech-to-text | **Local, open-source Whisper** (`faster-whisper`) | No STT API key or per-transcription cost; runs as its own container |
| LLM scoring | Claude (Anthropic), tool-use / structured output | Two independent calls per session — see above |
| Auth | JWT, email + password | Minimal, no third-party auth provider |
| Code editor | Monaco (`@monaco-editor/react`) | JS/Python/Java syntax highlighting; no execution sandbox — code correctness is graded by Claude, not run |

## Running locally

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY

docker compose up --build

# in another terminal, once the backend container is up: load the problem bank + demo sessions
docker compose exec backend npm run seed
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- STT service: http://localhost:8001 (mapped from container port 8000)
- Postgres: localhost:5432

The first `stt-service` start downloads the Whisper "base" model (~150MB) from Hugging Face and caches it in a named volume, so subsequent starts are fast.

### Option B — Run each piece manually

```bash
# 1. Postgres (only Postgres, if you don't want the rest in Docker)
docker compose up -d postgres

# 2. Backend
cd backend
cp .env.example .env   # fill in ANTHROPIC_API_KEY
npm install
npx prisma migrate dev
npm run seed            # loads the 15 problems + 4 pre-scored demo sessions
npm run dev              # http://localhost:4000

# 3. STT service (needed for live recordings; not needed to browse the seeded demo)
cd stt-service
pip install -r requirements.txt
uvicorn main:app --port 8000
# then set STT_SERVICE_URL=http://localhost:8000 in backend/.env (8001 if you keep the compose mapping)

# 4. Frontend
cd frontend
npm install
npm run dev              # http://localhost:5173
```

### Try it without recording anything

Log in with the seeded demo account to see fully-scored example sessions immediately:

- **Email:** `demo@articulate.dev`
- **Password:** `demo12345`

This includes the flagship "great code, weak explanation" example, its inverse, a both-strong example, and a both-weak example — so the product's value is visible even before you record your own voice or configure an Anthropic key.

## API keys needed

| Key | Required for | Where |
|---|---|---|
| `ANTHROPIC_API_KEY` | Both scoring calls | [console.anthropic.com](https://console.anthropic.com) → set in `backend/.env` |

No other API key is required — speech-to-text runs locally via `faster-whisper`.

## Known limitations / non-goals (v1)

- **No video analysis.** Audio/transcript only — no facial expression or eye-contact scoring.
- **No code execution.** Correctness is graded by Claude reading the code, not by running it against test cases. This keeps the app simple (no sandboxing infra) but means it can be wrong about runtime behavior it didn't actually check.
- **No live interview simulation.** No follow-up questions or back-and-forth in v1 — a natural next step would be a Claude-driven follow-up question after the initial explanation, mimicking a real interviewer probing a weak spot.
- **Filler-word detection is a simple regex heuristic**, not a real disfluency model — words like "so" and "actually" are sometimes legitimate transitions, not filler. It's a deliberately crude, explainable signal to ground the LLM score, not a precise linguistic measurement.
- **Known moderate-severity dev-dependency advisories** (`npm audit`): the pinned `vite`/`esbuild` and `react-router` versions have open advisories whose fixes require breaking major-version upgrades. Both are dev-time/framework-level issues (a Vite dev-server CORS quirk and a router open-redirect edge case) rather than issues in this app's own code; upgrading is a reasonable follow-up but was left out of v1 to avoid an unplanned framework migration.

## Deploying to a free-tier host

This wasn't deployed as part of this build, but the target stack maps cleanly to:

1. **Database:** [Render](https://render.com) or [Railway](https://railway.app) managed PostgreSQL (free tier).
2. **Backend:** Render/Railway web service running `npm run build && npm start` in `backend/`, with `DATABASE_URL`, `ANTHROPIC_API_KEY`, `JWT_SECRET`, and `STT_SERVICE_URL` set as environment variables. Run `npx prisma migrate deploy` as a release/build step.
3. **STT service:** Deploy `stt-service/` as its own Render/Railway service from its Dockerfile (CPU-only `faster-whisper` runs fine on a free-tier instance for `base`-size models, just expect slower cold starts). Point the backend's `STT_SERVICE_URL` at it.
4. **Frontend:** [Vercel](https://vercel.com) for the static Vite build (`npm run build` → `frontend/dist`), with a rewrite/proxy for `/api/*` to the backend's deployed URL (or just set the frontend to call the full backend URL directly instead of relying on the dev-only Vite proxy).

Free-tier services on Render/Railway spin down when idle, so expect a cold-start delay (and a cold-start whisper-model reload) on the first request after inactivity.
