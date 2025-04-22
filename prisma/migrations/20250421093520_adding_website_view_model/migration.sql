-- CreateTable
CREATE TABLE "WebsiteView" (
    "id" TEXT NOT NULL,
    "show" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteView_pkey" PRIMARY KEY ("id")
);
