import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { env } from "./env";
import { authRouter } from "./routes/auth.routes";
import { problemsRouter } from "./routes/problems.routes";
import { sessionsRouter } from "./routes/sessions.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/sessions", sessionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` });
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});
