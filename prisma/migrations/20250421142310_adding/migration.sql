/*
  Warnings:

  - Added the required column `routeId` to the `WebsiteView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebsiteView" ADD COLUMN     "routeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WebsiteRoute" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL DEFAULT '',
    "url" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteRoute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WebsiteView" ADD CONSTRAINT "WebsiteView_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "WebsiteRoute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
