-- DropForeignKey
ALTER TABLE "StudentOnTeam" DROP CONSTRAINT "StudentOnTeam_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentOnTeam" DROP CONSTRAINT "StudentOnTeam_teamId_fkey";

-- AddForeignKey
ALTER TABLE "StudentOnTeam" ADD CONSTRAINT "StudentOnTeam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOnTeam" ADD CONSTRAINT "StudentOnTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
