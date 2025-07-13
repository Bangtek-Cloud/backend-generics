/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Asset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AssetLedger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Donor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Journal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_eventId_fkey";

-- DropForeignKey
ALTER TABLE "AssetLedger" DROP CONSTRAINT "AssetLedger_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Journal" DROP CONSTRAINT "Journal_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Journal" DROP CONSTRAINT "Journal_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_eventId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Asset";

-- DropTable
DROP TABLE "AssetLedger";

-- DropTable
DROP TABLE "Donation";

-- DropTable
DROP TABLE "Donor";

-- DropTable
DROP TABLE "Journal";

-- DropTable
DROP TABLE "Transaction";
