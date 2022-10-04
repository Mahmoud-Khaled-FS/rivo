/*
  Warnings:

  - You are about to drop the column `privite` on the `video` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `video` DROP COLUMN `privite`,
    ADD COLUMN `private` BOOLEAN NOT NULL DEFAULT false;
