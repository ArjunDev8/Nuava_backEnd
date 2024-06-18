-- CreateTable
CREATE TABLE "TournamentDay" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "tournamentId" INTEGER NOT NULL,

    CONSTRAINT "TournamentDay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TournamentDay" ADD CONSTRAINT "TournamentDay_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
