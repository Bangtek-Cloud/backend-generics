/*
  Warnings:

  - The values [STAKEHOLDER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `eventId` to the `Tournaments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlayerType" ADD VALUE 'BRAND';
ALTER TYPE "PlayerType" ADD VALUE 'TEAM';
ALTER TYPE "PlayerType" ADD VALUE 'ORGANIZATION';
ALTER TYPE "PlayerType" ADD VALUE 'COMPANY';
ALTER TYPE "PlayerType" ADD VALUE 'ENTITY';
ALTER TYPE "PlayerType" ADD VALUE 'GROUP';
ALTER TYPE "PlayerType" ADD VALUE 'CLUB';
ALTER TYPE "PlayerType" ADD VALUE 'CORPORATION';
ALTER TYPE "PlayerType" ADD VALUE 'PARTNERSHIP';
ALTER TYPE "PlayerType" ADD VALUE 'FIRM';
ALTER TYPE "PlayerType" ADD VALUE 'AGENCY';
ALTER TYPE "PlayerType" ADD VALUE 'GOVERNMENT';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'SUPPORTER', 'VOLUNTEER', 'DONOR', 'ADMIN', 'VENDOR', 'SU');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Contestant" ADD COLUMN     "equipmentOwned" JSONB,
ADD COLUMN     "shirtSize" TEXT;

-- AlterTable
ALTER TABLE "Tournaments" ADD COLUMN     "eventId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "logo" BYTEA,
    "status" "TournamentStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tournaments" ADD CONSTRAINT "Tournaments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
