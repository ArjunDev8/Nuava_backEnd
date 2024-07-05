-- DropForeignKey
ALTER TABLE "TeamVersion" DROP CONSTRAINT "TeamVersion_teamId_fkey";

-- AddForeignKey
ALTER TABLE "TeamVersion" ADD CONSTRAINT "TeamVersion_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
