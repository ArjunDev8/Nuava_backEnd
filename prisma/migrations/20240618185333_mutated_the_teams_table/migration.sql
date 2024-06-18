/*
  Warnings:

  - You are about to drop the column `awayTeamID` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamID` on the `Fixture` table. All the data in the column will be lost.
  - Added the required column `teamID1` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamID2` to the `Fixture` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_awayTeamID_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_homeTeamID_fkey";

-- AlterTable
ALTER TABLE "Fixture" DROP COLUMN "awayTeamID",
DROP COLUMN "homeTeamID",
ADD COLUMN     "isBye" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamID1" INTEGER NOT NULL,
ADD COLUMN     "teamID2" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_teamID1_fkey" FOREIGN KEY ("teamID1") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_teamID2_fkey" FOREIGN KEY ("teamID2") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
