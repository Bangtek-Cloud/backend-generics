/*
  Warnings:

  - You are about to drop the column `eventId` on the `Bank` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_eventId_fkey";

-- AlterTable
ALTER TABLE "Bank" DROP COLUMN "eventId";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bankId" TEXT;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
