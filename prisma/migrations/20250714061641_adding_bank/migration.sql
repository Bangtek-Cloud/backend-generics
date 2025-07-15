-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "BankName" TEXT NOT NULL,
    "BankType" TEXT NOT NULL,
    "BankNo" TEXT NOT NULL,
    "noHp" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
