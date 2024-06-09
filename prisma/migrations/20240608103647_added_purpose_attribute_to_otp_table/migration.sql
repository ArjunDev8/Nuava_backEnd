/*
  Warnings:

  - Added the required column `purpose` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "purpose" TEXT NOT NULL;
