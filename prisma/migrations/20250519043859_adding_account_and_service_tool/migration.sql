-- CreateTable
CREATE TABLE "AlatService" (
    "id" TEXT NOT NULL,
    "sku" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "uom" TEXT NOT NULL,
    "qtyFirst" INTEGER NOT NULL,
    "amountFirst" INTEGER NOT NULL,
    "qtyLast" INTEGER,
    "amountLast" INTEGER,
    "qtySell" INTEGER,
    "amountSell" INTEGER,
    "stock" INTEGER,
    "sellingStock" INTEGER,

    CONSTRAINT "AlatService_pkey" PRIMARY KEY ("id")
);
