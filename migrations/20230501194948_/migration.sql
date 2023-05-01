/*
  Warnings:

  - Added the required column `creatorId` to the `Tank` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tank" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agility" INTEGER NOT NULL DEFAULT 1,
    "armor" INTEGER NOT NULL DEFAULT 1,
    "accuracy" INTEGER NOT NULL DEFAULT 1,
    "attackPower" INTEGER NOT NULL DEFAULT 1,
    "color" TEXT NOT NULL DEFAULT '353f4a',
    "creatorId" INTEGER NOT NULL,
    CONSTRAINT "Tank_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Tank" ("accuracy", "agility", "armor", "attackPower", "color", "id") SELECT "accuracy", "agility", "armor", "attackPower", "color", "id" FROM "Tank";
DROP TABLE "Tank";
ALTER TABLE "new_Tank" RENAME TO "Tank";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
