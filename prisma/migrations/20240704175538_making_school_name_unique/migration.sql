/*
  Warnings:

  - Added the required column `details` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isInterHouseEvent` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "details" JSONB NOT NULL,
ADD COLUMN     "isInterHouseEvent" BOOLEAN NOT NULL;
