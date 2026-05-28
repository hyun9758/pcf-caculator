/*
  Warnings:

  - Added the required column `activity_type` to the `activity_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `activity_data` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "activity_data" ADD COLUMN     "activity_type" TEXT NOT NULL,
ADD COLUMN     "date" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "emission_factors" ADD COLUMN     "valid_from" TEXT,
ADD COLUMN     "valid_to" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
