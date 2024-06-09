/*
  Warnings:

  - You are about to drop the column `Email` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `Phone` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `SchoolID` on the `Coach` table. All the data in the column will be lost.
  - You are about to drop the column `DisputingCoachID` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `Reason` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `ResolutionDetails` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `ScoreUpdateID` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Dispute` table. All the data in the column will be lost.
  - You are about to drop the column `AwayTeamID` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `HomeTeamID` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `Location` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `TournamentID` on the `Fixture` table. All the data in the column will be lost.
  - You are about to drop the column `AwayTeamScore` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `ConfirmationStatus` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `FinalScore` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `FixtureID` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `HomeTeamScore` on the `MatchResult` table. All the data in the column will be lost.
  - You are about to drop the column `FixtureID` on the `PlayerStat` table. All the data in the column will be lost.
  - You are about to drop the column `Metrics` on the `PlayerStat` table. All the data in the column will be lost.
  - You are about to drop the column `StudentID` on the `PlayerStat` table. All the data in the column will be lost.
  - You are about to drop the column `Timestamp` on the `PlayerStat` table. All the data in the column will be lost.
  - You are about to drop the column `Address` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `ContactDetails` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `ConfirmingCoachID` on the `ScoreUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `FixtureID` on the `ScoreUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `ProposingCoachID` on the `ScoreUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `ScoreDetails` on the `ScoreUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `ScoreUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `Time` on the `ScoreUpdate` table. All the data in the column will be lost.
  - You are about to drop the column `DataType` on the `StatMetric` table. All the data in the column will be lost.
  - You are about to drop the column `Description` on the `StatMetric` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `StatMetric` table. All the data in the column will be lost.
  - You are about to drop the column `Age` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `Grade` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `ModeratorAccess` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `SchoolID` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `TeamID` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `CoachID` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `SchoolID` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `Sport` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `Date` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `Location` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `CoachID` on the `Tryout` table. All the data in the column will be lost.
  - You are about to drop the column `Date` on the `Tryout` table. All the data in the column will be lost.
  - You are about to drop the column `Location` on the `Tryout` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Tryout` table. All the data in the column will be lost.
  - You are about to drop the column `SchoolID` on the `Tryout` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `TryoutParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `StudentID` on the `TryoutParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `TryoutID` on the `TryoutParticipant` table. All the data in the column will be lost.
  - Added the required column `email` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolID` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disputingCoachID` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reason` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resolutionDetails` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreUpdateID` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Dispute` table without a default value. This is not possible if the table is not empty.
  - Added the required column `awayTeamID` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamID` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tournamentID` to the `Fixture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `awayTeamScore` to the `MatchResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `confirmationStatus` to the `MatchResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalScore` to the `MatchResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixtureID` to the `MatchResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeamScore` to the `MatchResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixtureID` to the `PlayerStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metrics` to the `PlayerStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentID` to the `PlayerStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timestamp` to the `PlayerStat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactDetails` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `School` table without a default value. This is not possible if the table is not empty.
  - Added the required column `confirmingCoachID` to the `ScoreUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixtureID` to the `ScoreUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposingCoachID` to the `ScoreUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreDetails` to the `ScoreUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ScoreUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `ScoreUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataType` to the `StatMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `StatMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `StatMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `age` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grade` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moderatorAccess` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolID` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamID` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coachID` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolID` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sport` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coachID` to the `Tryout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Tryout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Tryout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Tryout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolID` to the `Tryout` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `TryoutParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentID` to the `TryoutParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tryoutID` to the `TryoutParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Coach" DROP CONSTRAINT "Coach_SchoolID_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_AwayTeamID_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_HomeTeamID_fkey";

-- DropForeignKey
ALTER TABLE "Fixture" DROP CONSTRAINT "Fixture_TournamentID_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_SchoolID_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_TeamID_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_CoachID_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_SchoolID_fkey";

-- DropForeignKey
ALTER TABLE "Tryout" DROP CONSTRAINT "Tryout_CoachID_fkey";

-- DropForeignKey
ALTER TABLE "Tryout" DROP CONSTRAINT "Tryout_SchoolID_fkey";

-- DropForeignKey
ALTER TABLE "TryoutParticipant" DROP CONSTRAINT "TryoutParticipant_StudentID_fkey";

-- DropForeignKey
ALTER TABLE "TryoutParticipant" DROP CONSTRAINT "TryoutParticipant_TryoutID_fkey";

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "Email",
DROP COLUMN "Name",
DROP COLUMN "Phone",
DROP COLUMN "SchoolID",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "schoolID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Dispute" DROP COLUMN "DisputingCoachID",
DROP COLUMN "Reason",
DROP COLUMN "ResolutionDetails",
DROP COLUMN "ScoreUpdateID",
DROP COLUMN "Status",
ADD COLUMN     "disputingCoachID" INTEGER NOT NULL,
ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "resolutionDetails" TEXT NOT NULL,
ADD COLUMN     "scoreUpdateID" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Fixture" DROP COLUMN "AwayTeamID",
DROP COLUMN "HomeTeamID",
DROP COLUMN "Location",
DROP COLUMN "TournamentID",
ADD COLUMN     "awayTeamID" INTEGER NOT NULL,
ADD COLUMN     "homeTeamID" INTEGER NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "tournamentID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "MatchResult" DROP COLUMN "AwayTeamScore",
DROP COLUMN "ConfirmationStatus",
DROP COLUMN "FinalScore",
DROP COLUMN "FixtureID",
DROP COLUMN "HomeTeamScore",
ADD COLUMN     "awayTeamScore" TEXT NOT NULL,
ADD COLUMN     "confirmationStatus" TEXT NOT NULL,
ADD COLUMN     "finalScore" TEXT NOT NULL,
ADD COLUMN     "fixtureID" INTEGER NOT NULL,
ADD COLUMN     "homeTeamScore" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlayerStat" DROP COLUMN "FixtureID",
DROP COLUMN "Metrics",
DROP COLUMN "StudentID",
DROP COLUMN "Timestamp",
ADD COLUMN     "fixtureID" INTEGER NOT NULL,
ADD COLUMN     "metrics" JSONB NOT NULL,
ADD COLUMN     "studentID" INTEGER NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "School" DROP COLUMN "Address",
DROP COLUMN "ContactDetails",
DROP COLUMN "Name",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "contactDetails" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScoreUpdate" DROP COLUMN "ConfirmingCoachID",
DROP COLUMN "FixtureID",
DROP COLUMN "ProposingCoachID",
DROP COLUMN "ScoreDetails",
DROP COLUMN "Status",
DROP COLUMN "Time",
ADD COLUMN     "confirmingCoachID" INTEGER NOT NULL,
ADD COLUMN     "fixtureID" INTEGER NOT NULL,
ADD COLUMN     "proposingCoachID" INTEGER NOT NULL,
ADD COLUMN     "scoreDetails" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "time" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "StatMetric" DROP COLUMN "DataType",
DROP COLUMN "Description",
DROP COLUMN "Name",
ADD COLUMN     "dataType" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "Age",
DROP COLUMN "Grade",
DROP COLUMN "ModeratorAccess",
DROP COLUMN "Name",
DROP COLUMN "SchoolID",
DROP COLUMN "TeamID",
ADD COLUMN     "age" INTEGER NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "grade" TEXT NOT NULL,
ADD COLUMN     "moderatorAccess" BOOLEAN NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "schoolID" INTEGER NOT NULL,
ADD COLUMN     "teamID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "CoachID",
DROP COLUMN "Name",
DROP COLUMN "SchoolID",
DROP COLUMN "Sport",
ADD COLUMN     "coachID" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "schoolID" INTEGER NOT NULL,
ADD COLUMN     "sport" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "Date",
DROP COLUMN "Location",
DROP COLUMN "Name",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Tryout" DROP COLUMN "CoachID",
DROP COLUMN "Date",
DROP COLUMN "Location",
DROP COLUMN "Name",
DROP COLUMN "SchoolID",
ADD COLUMN     "coachID" INTEGER NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "schoolID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TryoutParticipant" DROP COLUMN "Status",
DROP COLUMN "StudentID",
DROP COLUMN "TryoutID",
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "studentID" INTEGER NOT NULL,
ADD COLUMN     "tryoutID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolID_fkey" FOREIGN KEY ("schoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_teamID_fkey" FOREIGN KEY ("teamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_schoolID_fkey" FOREIGN KEY ("schoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_schoolID_fkey" FOREIGN KEY ("schoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_homeTeamID_fkey" FOREIGN KEY ("homeTeamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_awayTeamID_fkey" FOREIGN KEY ("awayTeamID") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fixture" ADD CONSTRAINT "Fixture_tournamentID_fkey" FOREIGN KEY ("tournamentID") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tryout" ADD CONSTRAINT "Tryout_coachID_fkey" FOREIGN KEY ("coachID") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tryout" ADD CONSTRAINT "Tryout_schoolID_fkey" FOREIGN KEY ("schoolID") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryoutParticipant" ADD CONSTRAINT "TryoutParticipant_tryoutID_fkey" FOREIGN KEY ("tryoutID") REFERENCES "Tryout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TryoutParticipant" ADD CONSTRAINT "TryoutParticipant_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
