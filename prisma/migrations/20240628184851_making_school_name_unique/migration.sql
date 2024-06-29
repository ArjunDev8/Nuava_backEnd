/*
  Warnings:

  - Added the required column `intervalBetweenMatches` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `matchDuration` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizerCoachId` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ParticipatingSchool" DROP CONSTRAINT "ParticipatingSchool_tournamentId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentDay" DROP CONSTRAINT "TournamentDay_tournamentId_fkey";

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "intervalBetweenMatches" INTEGER NOT NULL,
ADD COLUMN     "matchDuration" INTEGER NOT NULL,
ADD COLUMN     "organizerCoachId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "TournamentDay" ADD CONSTRAINT "TournamentDay_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipatingSchool" ADD CONSTRAINT "ParticipatingSchool_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
