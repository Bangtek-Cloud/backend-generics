/*
  Warnings:

  - Added the required column `eventId` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `AlatService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "eventId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AlatService" ADD COLUMN     "eventId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlatService" ADD CONSTRAINT "AlatService_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
