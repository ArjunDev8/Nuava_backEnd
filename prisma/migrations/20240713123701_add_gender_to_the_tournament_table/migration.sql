-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('Goal', 'RedCard', 'YellowCard');

-- CreateTable
CREATE TABLE "ScoreLog" (
    "id" SERIAL NOT NULL,
    "fixtureID" INTEGER NOT NULL,
    "teamID" INTEGER NOT NULL,
    "playerID" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" "EventType" NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ScoreLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" SERIAL NOT NULL,
    "fixtureID" INTEGER NOT NULL,
    "teamID" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamScore_fixtureID_teamID_key" ON "TeamScore"("fixtureID", "teamID");

-- AddForeignKey
ALTER TABLE "ScoreLog" ADD CONSTRAINT "ScoreLog_fixtureID_fkey" FOREIGN KEY ("fixtureID") REFERENCES "Fixture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreLog" ADD CONSTRAINT "ScoreLog_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_fixtureID_fkey" FOREIGN KEY ("fixtureID") REFERENCES "Fixture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
