-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('DRAFT', 'TRANSCRIBING', 'SCORING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "constraints" TEXT,
    "examples" JSONB NOT NULL,
    "starterCode" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "audioPath" TEXT,
    "transcript" TEXT,
    "segments" JSONB,
    "status" "SessionStatus" NOT NULL DEFAULT 'DRAFT',
    "isSeed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "correctness" INTEGER NOT NULL,
    "timeComplexity" TEXT NOT NULL,
    "spaceComplexity" TEXT NOT NULL,
    "edgeCaseCoverage" INTEGER NOT NULL,
    "codeQuality" INTEGER NOT NULL,
    "rationale" TEXT NOT NULL,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunicationScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "structure" INTEGER NOT NULL,
    "clarity" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "completeness" INTEGER NOT NULL,
    "pacing" INTEGER NOT NULL,
    "tips" JSONB NOT NULL,
    "raw" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunicationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptMetrics" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "durationSec" DOUBLE PRECISION NOT NULL,
    "wordsPerMinute" DOUBLE PRECISION NOT NULL,
    "fillerCount" INTEGER NOT NULL,
    "fillerBreakdown" JSONB NOT NULL,
    "longestPauseMs" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_slug_key" ON "Problem"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CodeScore_sessionId_key" ON "CodeScore"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunicationScore_sessionId_key" ON "CommunicationScore"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptMetrics_sessionId_key" ON "TranscriptMetrics"("sessionId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeScore" ADD CONSTRAINT "CodeScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationScore" ADD CONSTRAINT "CommunicationScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptMetrics" ADD CONSTRAINT "TranscriptMetrics_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
