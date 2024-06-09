/*
  Warnings:

  - Added the required column `password` to the `Coach` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "password" TEXT NOT NULL;
