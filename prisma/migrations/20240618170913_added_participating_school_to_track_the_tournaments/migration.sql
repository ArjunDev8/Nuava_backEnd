-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_teamID_fkey";

-- CreateTable
CREATE TABLE "StudentOnTeam" (
    "studentId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "StudentOnTeam_pkey" PRIMARY KEY ("studentId","teamId")
);

-- AddForeignKey
ALTER TABLE "StudentOnTeam" ADD CONSTRAINT "StudentOnTeam_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentOnTeam" ADD CONSTRAINT "StudentOnTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
