import { Router } from "express";
import { prisma } from "../db";
import { asyncHandler } from "../utils/asyncHandler";

export const problemsRouter = Router();

problemsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const problems = await prisma.problem.findMany({
      orderBy: [{ category: "asc" }, { title: "asc" }],
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        difficulty: true,
      },
    });
    res.json({ problems });
  })
);

problemsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const problem = await prisma.problem.findUnique({ where: { slug: req.params.slug } });
    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }
    res.json({ problem });
  })
);
