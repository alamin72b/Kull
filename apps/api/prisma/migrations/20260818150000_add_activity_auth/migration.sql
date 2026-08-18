-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "passwordHash" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddColumn
ALTER TABLE "activities" ADD COLUMN "userId" UUID;

-- Existing activity rows are retained with a NULL userId. Activity endpoints
-- always filter by the authenticated user ID, so these legacy rows are never
-- exposed until they are explicitly assigned to an account.

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "activities_userId_activityDate_startAt_idx"
  ON "activities"("userId", "activityDate", "startAt");
