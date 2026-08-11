/*
  Warnings:

  - You are about to drop the column `fuelCostOverride` on the `loads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `loads` DROP COLUMN `fuelCostOverride`,
    ADD COLUMN `tripAmount` DOUBLE NOT NULL DEFAULT 0;
