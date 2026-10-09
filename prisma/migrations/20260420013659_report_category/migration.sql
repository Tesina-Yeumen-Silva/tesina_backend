/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ReportCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReportCategory_name_key" ON "ReportCategory"("name");
