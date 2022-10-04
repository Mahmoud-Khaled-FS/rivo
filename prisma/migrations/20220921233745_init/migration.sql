/*
  Warnings:

  - Added the required column `location` to the `video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `video` ADD COLUMN `location` VARCHAR(255) NOT NULL;
