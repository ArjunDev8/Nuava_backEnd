-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_tournamentID_fkey";

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_tournamentID_fkey" FOREIGN KEY ("tournamentID") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
