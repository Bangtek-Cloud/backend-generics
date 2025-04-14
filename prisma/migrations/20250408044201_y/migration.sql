/*
  Warnings:

  - The values [SUPPORTER,VOLUNTEER,DONOR,VENDOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ConsType" AS ENUM ('PLAYER', 'SUPPORTER', 'VOLUNTEER', 'DONOR');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN', 'STAKEHOLDER', 'SU');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- AlterTable
ALTER TABLE "Contestant" ADD COLUMN     "contestantType" "ConsType" NOT NULL DEFAULT 'PLAYER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "usingAvatar" BOOLEAN NOT NULL DEFAULT false;
