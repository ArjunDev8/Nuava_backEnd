/*
  Warnings:

  - Added the required column `organizingSchoolId` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "organizingSchoolId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizingSchoolId_fkey" FOREIGN KEY ("organizingSchoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
