-- CreateTable
CREATE TABLE "Donor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "donorId" INTEGER NOT NULL,
    "eventId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
