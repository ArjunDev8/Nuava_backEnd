/*
  Warnings:

  - Made the column `playerID` on table `ScoreLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ScoreLog" ALTER COLUMN "playerID" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ScoreLog" ADD CONSTRAINT "ScoreLog_playerID_fkey" FOREIGN KEY ("playerID") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
