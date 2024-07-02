/*
  Warnings:

  - You are about to drop the column `date` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Events` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Events` table. All the data in the column will be lost.
  - Added the required column `allDay` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" DROP COLUMN "date",
DROP COLUMN "location",
DROP COLUMN "name",
ADD COLUMN     "allDay" BOOLEAN NOT NULL,
ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
