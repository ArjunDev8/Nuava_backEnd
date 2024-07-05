/*
  Warnings:

  - You are about to drop the column `teamID1` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `teamID2` on the `Fixture` table. All the data in the column will be lost.
  - Added the required column `teamParticipationId1` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamParticipationId2` to the `Fixture` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_teamID1_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_teamID2_fkey";

-- AlterTable
ALTER TABLE "Fixture" DROP COLUMN "teamID1",
DROP COLUMN "teamID2",
ADD COLUMN     "teamParticipationId1" INTEGER NOT NULL,
ADD COLUMN     "teamParticipationId2" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TeamParticipation" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,

    CONSTRAINT "TeamParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teamId" ON "TeamParticipation"("teamId");

-- CreateIndex
CREATE INDEX "tournamentId" ON "TeamParticipation"("tournamentId");

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_teamParticipationId1_fkey" FOREIGN KEY ("teamParticipationId1") REFERENCES "TeamParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_teamParticipationId2_fkey" FOREIGN KEY ("teamParticipationId2") REFERENCES "TeamParticipation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamParticipation" ADD CONSTRAINT "TeamParticipation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamParticipation" ADD CONSTRAINT "TeamParticipation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
