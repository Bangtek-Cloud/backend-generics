-- AlterTable
ALTER TABLE "Contestant" ADD COLUMN     "logo" TEXT,
ADD COLUMN     "price" JSONB,
ADD COLUMN     "usingLogo" BOOLEAN NOT NULL DEFAULT false;
