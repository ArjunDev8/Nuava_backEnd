-- DropForeignKey
ALTER TABLE "ScoreLog" DROP CONSTRAINT "ScoreLog_teamID_fkey";

-- AlterTable
ALTER TABLE "ScoreLog" ADD COLUMN     "teamId" INTEGER;

-- AddForeignKey
ALTER TABLE "ScoreLog" ADD CONSTRAINT "ScoreLog_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "TeamParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreLog" ADD CONSTRAINT "ScoreLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
