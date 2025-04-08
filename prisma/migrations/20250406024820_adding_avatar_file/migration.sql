-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarFile" BYTEA,
ALTER COLUMN "avatar" DROP NOT NULL;
