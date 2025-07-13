/*
  Warnings:

  - You are about to drop the column `email` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uid]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `uid` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Session_email_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "email",
ADD COLUMN     "uid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_uid_key" ON "Session"("uid");
