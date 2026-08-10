/*
  Warnings:

  - You are about to alter the column `note` on the `activities` table. The data in that column could be lost. The data in that column will be cast from `VarChar(1200)` to `VarChar(1000)`.

*/
-- CreateEnum
CREATE TYPE "DebugNoteStatus" AS ENUM ('UNSOLVED', 'IN_PROGRESS', 'SOLVED');

-- AlterTable
ALTER TABLE "activities" ALTER COLUMN "note" SET DATA TYPE VARCHAR(1000);

-- CreateTable
CREATE TABLE "debug_notes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "summary" VARCHAR(280),
    "errorMessage" TEXT NOT NULL,
    "context" TEXT,
    "stepsToReproduce" TEXT,
    "environment" TEXT,
    "rootCause" TEXT,
    "solution" TEXT,
    "verification" TEXT,
    "findings" TEXT,
    "learnings" TEXT,
    "status" "DebugNoteStatus" NOT NULL DEFAULT 'UNSOLVED',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "debug_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debug_tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "debug_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debug_note_tags" (
    "debugNoteId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "debug_note_tags_pkey" PRIMARY KEY ("debugNoteId","tagId")
);

-- CreateTable
CREATE TABLE "debug_screenshots" (
    "id" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "originalName" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "debugNoteId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debug_screenshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "debug_notes_status_updatedAt_idx" ON "debug_notes"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "debug_notes_isPinned_updatedAt_idx" ON "debug_notes"("isPinned", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "debug_tags_name_key" ON "debug_tags"("name");

-- CreateIndex
CREATE INDEX "debug_note_tags_tagId_idx" ON "debug_note_tags"("tagId");

-- CreateIndex
CREATE INDEX "debug_screenshots_debugNoteId_idx" ON "debug_screenshots"("debugNoteId");

-- AddForeignKey
ALTER TABLE "debug_note_tags" ADD CONSTRAINT "debug_note_tags_debugNoteId_fkey" FOREIGN KEY ("debugNoteId") REFERENCES "debug_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debug_note_tags" ADD CONSTRAINT "debug_note_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "debug_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "debug_screenshots" ADD CONSTRAINT "debug_screenshots_debugNoteId_fkey" FOREIGN KEY ("debugNoteId") REFERENCES "debug_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
