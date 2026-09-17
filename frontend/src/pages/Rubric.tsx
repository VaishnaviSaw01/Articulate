export function Rubric() {
  return (
    <div className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold text-slate-900">How scoring works</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        Articulate makes two separate, independently-prompted calls to Claude for every session —
        one never sees the other's input. This keeps "can you code" and "can you explain your
        code" honest, decoupled signals instead of one blended vibe score.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-code-500/30 bg-white p-5">
          <h2 className="text-lg font-semibold text-code-700">Code correctness rubric</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sees only your submitted code and the problem statement. Never sees your transcript.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-800">Correctness (1-10)</dt>
              <dd className="text-slate-600">Does it actually solve the problem for the given examples and constraints?</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Edge case coverage (1-10)</dt>
              <dd className="text-slate-600">Empty inputs, duplicates, negatives, overflow — the boundary conditions.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Code quality (1-10)</dt>
              <dd className="text-slate-600">Naming, structure, idiomatic use of the language.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Time / space complexity</dt>
              <dd className="text-slate-600">The tightest accurate Big-O of the code as written.</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-comm-500/30 bg-white p-5">
          <h2 className="text-lg font-semibold text-comm-700">Communication rubric</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sees only your transcript, the problem statement, and deterministic speech metrics.
            Never sees your code.
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-800">Structure (1-10)</dt>
              <dd className="text-slate-600">Did you state your approach before diving into implementation details?</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Clarity (1-10)</dt>
              <dd className="text-slate-600">Plain language a non-expert interviewer could follow, vs. unexplained jargon.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Confidence (1-10)</dt>
              <dd className="text-slate-600">Grounded in measured filler-word density and pause length, not just vibes.</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Completeness (1-10)</dt>
              <dd className="text-slate-600">Did you say the complexity, trade-offs, and an edge case out loud?</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Pacing (1-10)</dt>
              <dd className="text-slate-600">Words-per-minute in a comfortable conversational range (~120-160 wpm).</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">Deterministic signals</h2>
        <p className="mt-2 text-sm text-slate-600">
          Before the transcript ever reaches Claude, we compute words-per-minute, filler-word
          counts ("um", "uh", "like", "so", "basically", "actually", "you know"), and the longest
          gap between transcript segments as a pause proxy. These numbers are injected into the
          communication prompt as ground truth, so the qualitative score is anchored to something
          measurable rather than being a pure LLM guess.
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-800">Prompt source</h2>
        <p className="mt-2 text-sm text-slate-600">
          Both system prompts live in <code>backend/prompts/</code> as first-class, version-controlled
          files: <code>codeCorrectness.prompt.ts</code> and <code>communicationScore.prompt.ts</code>.
          Read them directly if you want the exact grading instructions.
        </p>
      </section>
    </div>
  );
}
