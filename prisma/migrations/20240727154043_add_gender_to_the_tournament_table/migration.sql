-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_teamParticipationId1_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_teamParticipationId2_fkey";

-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "fixtureStartStatus" TEXT NOT NULL DEFAULT 'notStarted',
ALTER COLUMN "teamParticipationId1" DROP NOT NULL,
ALTER COLUMN "teamParticipationId2" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_teamParticipationId1_fkey" FOREIGN KEY ("teamParticipationId1") REFERENCES "TeamParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_teamParticipationId2_fkey" FOREIGN KEY ("teamParticipationId2") REFERENCES "TeamParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
