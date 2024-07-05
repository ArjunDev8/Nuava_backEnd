-- DropForeignKey
ALTER TABLE "TeamParticipation" DROP CONSTRAINT "TeamParticipation_tournamentId_fkey";

-- AddForeignKey
ALTER TABLE "TeamParticipation" ADD CONSTRAINT "TeamParticipation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
