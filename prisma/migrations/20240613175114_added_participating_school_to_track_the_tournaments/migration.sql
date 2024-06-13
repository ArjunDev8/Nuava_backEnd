-- CreateTable
CREATE TABLE "ParticipatingSchool" (
    "schoolId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,

    CONSTRAINT "ParticipatingSchool_pkey" PRIMARY KEY ("schoolId","tournamentId")
);

-- AddForeignKey
ALTER TABLE "ParticipatingSchool" ADD CONSTRAINT "ParticipatingSchool_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipatingSchool" ADD CONSTRAINT "ParticipatingSchool_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
