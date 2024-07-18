/*
  Warnings:

  - Added the required column `awayTeamID` to the `MatchResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamID` to the `MatchResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchResult" ADD COLUMN     "awayTeamID" INTEGER NOT NULL,
ADD COLUMN     "homeTeamID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_homeTeamID_fkey" FOREIGN KEY ("homeTeamID") REFERENCES "TeamParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchResult" ADD CONSTRAINT "MatchResult_awayTeamID_fkey" FOREIGN KEY ("awayTeamID") REFERENCES "TeamParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
