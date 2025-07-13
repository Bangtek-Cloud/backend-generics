/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ladger` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Ladger" DROP CONSTRAINT "Ladger_eventId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Ladger";

-- CreateTable
CREATE TABLE "Finance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Finance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Finance" ADD CONSTRAINT "Finance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
