-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "activityDate" DATE NOT NULL,
    "startAt" TIMESTAMPTZ(3) NOT NULL,
    "endAt" TIMESTAMPTZ(3) NOT NULL,
    "note" VARCHAR(1200) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activities_activityDate_startAt_idx" ON "activities"("activityDate", "startAt");
