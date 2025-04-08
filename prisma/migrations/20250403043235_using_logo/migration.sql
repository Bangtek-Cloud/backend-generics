/*
  Warnings:

  - You are about to drop the column `price` on the `Contestant` table. All the data in the column will be lost.
  - Added the required column `price` to the `Tournaments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contestant" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "Tournaments" ADD COLUMN     "disabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" JSONB NOT NULL,
ADD COLUMN     "usingLogoPrice" INTEGER;
