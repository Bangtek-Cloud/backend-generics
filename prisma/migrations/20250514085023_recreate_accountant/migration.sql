/*
  Warnings:

  - You are about to drop the `Assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Finance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- DropForeignKey
ALTER TABLE "Assets" DROP CONSTRAINT "Assets_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Donors" DROP CONSTRAINT "Donors_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Finance" DROP CONSTRAINT "Finance_eventId_fkey";

-- DropTable
DROP TABLE "Assets";

-- DropTable
DROP TABLE "Donors";

-- DropTable
DROP TABLE "Finance";

-- DropTable
DROP TABLE "Product";

-- CreateTable
CREATE TABLE "Account" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Journal" (
    "id" SERIAL NOT NULL,
    "transactionId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,
    "debit" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Journal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "value" INTEGER NOT NULL,
    "condition" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pic" TEXT,
    "notes" TEXT,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetLedger" (
    "id" SERIAL NOT NULL,
    "assetId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "value" INTEGER,
    "location" TEXT,
    "pic" TEXT,
    "notes" TEXT,

    CONSTRAINT "AssetLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_code_key" ON "Asset"("code");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journal" ADD CONSTRAINT "Journal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetLedger" ADD CONSTRAINT "AssetLedger_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
