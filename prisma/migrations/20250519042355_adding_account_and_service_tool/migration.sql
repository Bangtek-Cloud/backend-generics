-- CreateEnum
CREATE TYPE "CreditDebitType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "amount" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "CreditDebitType" NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
