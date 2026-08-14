/*
  Warnings:

  - You are about to drop the `debug_note_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `debug_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `debug_screenshots` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `debug_tags` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DebugNoteSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "debug_note_tags" DROP CONSTRAINT "debug_note_tags_debugNoteId_fkey";

-- DropForeignKey
ALTER TABLE "debug_note_tags" DROP CONSTRAINT "debug_note_tags_tagId_fkey";

-- DropForeignKey
ALTER TABLE "debug_screenshots" DROP CONSTRAINT "debug_screenshots_debugNoteId_fkey";

-- DropTable
DROP TABLE "debug_note_tags";

-- DropTable
DROP TABLE "debug_notes";

-- DropTable
DROP TABLE "debug_screenshots";

-- DropTable
DROP TABLE "debug_tags";

-- CreateTable
CREATE TABLE "DebugNote" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "summary" TEXT,
    "status" "DebugNoteStatus" NOT NULL DEFAULT 'UNSOLVED',
    "severity" "DebugNoteSeverity" NOT NULL DEFAULT 'MEDIUM',
    "errorMessage" TEXT NOT NULL,
    "context" TEXT,
    "stepsToReproduce" TEXT,
    "environment" TEXT,
    "attemptedSolutions" TEXT,
    "rootCause" TEXT,
    "solution" TEXT,
    "codeSnippet" TEXT,
    "verification" TEXT,
    "findings" TEXT,
    "learnings" TEXT,
    "thoughts" TEXT,
    "references" TEXT,
    "occurredAt" TIMESTAMP(3),
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebugNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebugTag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "normalizedName" VARCHAR(50) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebugTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebugNoteTag" (
    "debugNoteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DebugNoteTag_pkey" PRIMARY KEY ("debugNoteId","tagId")
);

-- CreateTable
CREATE TABLE "DebugScreenshot" (
    "id" TEXT NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "caption" VARCHAR(200),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "debugNoteId" TEXT NOT NULL,

    CONSTRAINT "DebugScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DebugNote_status_idx" ON "DebugNote"("status");

-- CreateIndex
CREATE INDEX "DebugNote_severity_idx" ON "DebugNote"("severity");

-- CreateIndex
CREATE INDEX "DebugNote_occurredAt_idx" ON "DebugNote"("occurredAt");

-- CreateIndex
CREATE INDEX "DebugNote_isPinned_updatedAt_idx" ON "DebugNote"("isPinned", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DebugTag_normalizedName_key" ON "DebugTag"("normalizedName");

-- CreateIndex
CREATE INDEX "DebugNoteTag_tagId_idx" ON "DebugNoteTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "DebugScreenshot_fileName_key" ON "DebugScreenshot"("fileName");

-- CreateIndex
CREATE INDEX "DebugScreenshot_debugNoteId_idx" ON "DebugScreenshot"("debugNoteId");

-- AddForeignKey
ALTER TABLE "DebugNoteTag" ADD CONSTRAINT "DebugNoteTag_debugNoteId_fkey" FOREIGN KEY ("debugNoteId") REFERENCES "DebugNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebugNoteTag" ADD CONSTRAINT "DebugNoteTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "DebugTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebugScreenshot" ADD CONSTRAINT "DebugScreenshot_debugNoteId_fkey" FOREIGN KEY ("debugNoteId") REFERENCES "DebugNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
