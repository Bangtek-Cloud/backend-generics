-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "showInWeb" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "SponsorInWeb" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "SponsorInWeb_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SponsorInWeb" ADD CONSTRAINT "SponsorInWeb_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
