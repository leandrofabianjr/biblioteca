/*
  Warnings:

  - Made the column `ownerId` on table `author` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `genre` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `item` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `location` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ownerId` on table `publisher` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "author" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "genre" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "item" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "location" ALTER COLUMN "ownerId" SET NOT NULL;

-- AlterTable
ALTER TABLE "publisher" ALTER COLUMN "ownerId" SET NOT NULL;
