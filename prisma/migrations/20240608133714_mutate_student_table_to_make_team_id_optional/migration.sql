-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_teamID_fkey";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "teamID" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
