/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `WebsiteRoute` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "WebsiteRoute" ALTER COLUMN "url" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteRoute_url_key" ON "WebsiteRoute"("url");
