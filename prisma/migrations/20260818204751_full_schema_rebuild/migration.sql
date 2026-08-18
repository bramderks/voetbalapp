/*
  Warnings:

  - You are about to drop the column `location` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `MatchStat` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `teamId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_activityId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_playerId_fkey";

-- DropForeignKey
ALTER TABLE "MatchStat" DROP CONSTRAINT "MatchStat_activityId_fkey";

-- DropForeignKey
ALTER TABLE "MatchStat" DROP CONSTRAINT "MatchStat_playerId_fkey";

-- DropIndex
DROP INDEX "Attendance_activityId_playerId_key";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "location",
DROP COLUMN "status",
ADD COLUMN     "home" BOOLEAN,
ADD COLUMN     "teamId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "season" TEXT;

-- DropTable
DROP TABLE "MatchStat";

-- CreateTable
CREATE TABLE "PlayerStats" (
    "id" SERIAL NOT NULL,
    "playerId" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "present" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerStats_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlayerStats" ADD CONSTRAINT "PlayerStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
