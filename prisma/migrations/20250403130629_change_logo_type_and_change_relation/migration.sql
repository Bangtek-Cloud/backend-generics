/*
  Warnings:

  - The `logo` column on the `Contestant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `_TournamentContestants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tournamentId` to the `Contestant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_TournamentContestants" DROP CONSTRAINT "_TournamentContestants_A_fkey";

-- DropForeignKey
ALTER TABLE "_TournamentContestants" DROP CONSTRAINT "_TournamentContestants_B_fkey";

-- AlterTable
ALTER TABLE "Contestant" ADD COLUMN     "tournamentId" TEXT NOT NULL,
DROP COLUMN "logo",
ADD COLUMN     "logo" BYTEA;

-- DropTable
DROP TABLE "_TournamentContestants";

-- AddForeignKey
ALTER TABLE "Contestant" ADD CONSTRAINT "Contestant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournaments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
