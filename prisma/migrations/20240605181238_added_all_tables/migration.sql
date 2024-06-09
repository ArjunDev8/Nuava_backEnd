/*
  Warnings:

  - You are about to drop the column `email` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `tournament` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `coachId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Student` table. All the data in the column will be lost.
  - Added the required column `Email` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Phone` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SchoolID` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `AwayTeamID` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `HomeTeamID` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Location` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TournamentID` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Age` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Grade` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ModeratorAccess` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SchoolID` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TeamID` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_coachId_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_coachId_fkey";

-- DropIndex
DROP INDEX "Coach_email_key";

-- DropIndex
DROP INDEX "Student_email_key";

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "Email" TEXT NOT NULL,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "Phone" TEXT NOT NULL,
ADD COLUMN     "SchoolID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Fixture" DROP COLUMN "coachId",
DROP COLUMN "date",
DROP COLUMN "location",
DROP COLUMN "studentId",
DROP COLUMN "tournament",
ADD COLUMN     "AwayTeamID" INTEGER NOT NULL,
ADD COLUMN     "HomeTeamID" INTEGER NOT NULL,
ADD COLUMN     "Location" TEXT NOT NULL,
ADD COLUMN     "TournamentID" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "coachId",
DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "Age" INTEGER NOT NULL,
ADD COLUMN     "Grade" TEXT NOT NULL,
ADD COLUMN     "ModeratorAccess" BOOLEAN NOT NULL,
ADD COLUMN     "Name" TEXT NOT NULL,
ADD COLUMN     "SchoolID" INTEGER NOT NULL,
ADD COLUMN     "TeamID" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "ContactDetails" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Sport" TEXT NOT NULL,
    "SchoolID" INTEGER NOT NULL,
    "CoachID" INTEGER NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatMetric" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "DataType" TEXT NOT NULL,

    CONSTRAINT "StatMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Location" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" SERIAL NOT NULL,
    "ScoreUpdateID" INTEGER NOT NULL,
    "DisputingCoachID" INTEGER NOT NULL,
    "Reason" TEXT NOT NULL,
    "ResolutionDetails" TEXT NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreUpdate" (
    "id" SERIAL NOT NULL,
    "FixtureID" INTEGER NOT NULL,
    "ProposingCoachID" INTEGER NOT NULL,
    "ConfirmingCoachID" INTEGER NOT NULL,
    "Time" TIMESTAMP(3) NOT NULL,
    "ScoreDetails" TEXT NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "ScoreUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerStat" (
    "id" SERIAL NOT NULL,
    "FixtureID" INTEGER NOT NULL,
    "StudentID" INTEGER NOT NULL,
    "Metrics" JSONB NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchResult" (
    "id" SERIAL NOT NULL,
    "FixtureID" INTEGER NOT NULL,
    "FinalScore" TEXT NOT NULL,
    "HomeTeamScore" TEXT NOT NULL,
    "AwayTeamScore" TEXT NOT NULL,
    "ConfirmationStatus" TEXT NOT NULL,

    CONSTRAINT "MatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tryout" (
    "id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL,
    "Location" TEXT NOT NULL,
    "CoachID" INTEGER NOT NULL,
    "SchoolID" INTEGER NOT NULL,

    CONSTRAINT "Tryout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TryoutParticipant" (
    "id" SERIAL NOT NULL,
    "TryoutID" INTEGER NOT NULL,
    "StudentID" INTEGER NOT NULL,
    "Status" TEXT NOT NULL,

    CONSTRAINT "TryoutParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_SchoolID_fkey" FOREIGN KEY ("SchoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_TeamID_fkey" FOREIGN KEY ("TeamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_SchoolID_fkey" FOREIGN KEY ("SchoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_SchoolID_fkey" FOREIGN KEY ("SchoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_CoachID_fkey" FOREIGN KEY ("CoachID") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_HomeTeamID_fkey" FOREIGN KEY ("HomeTeamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_AwayTeamID_fkey" FOREIGN KEY ("AwayTeamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_TournamentID_fkey" FOREIGN KEY ("TournamentID") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tryout" ADD CONSTRAINT "Tryout_CoachID_fkey" FOREIGN KEY ("CoachID") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tryout" ADD CONSTRAINT "Tryout_SchoolID_fkey" FOREIGN KEY ("SchoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryoutParticipant" ADD CONSTRAINT "TryoutParticipant_TryoutID_fkey" FOREIGN KEY ("TryoutID") REFERENCES "Tryout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryoutParticipant" ADD CONSTRAINT "TryoutParticipant_StudentID_fkey" FOREIGN KEY ("StudentID") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
