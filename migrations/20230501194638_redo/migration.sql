/*
  Warnings:

  - You are about to drop the `Turn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `userId` on the `Tank` table. All the data in the column will be lost.
  - You are about to drop the column `gameId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `curr_player` on the `Game` table. All the data in the column will be lost.
  - Added the required column `adminId` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Turn";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PlayerInGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT '[]',
    "tankId" INTEGER NOT NULL,
    "mp" INTEGER NOT NULL DEFAULT 10,
    "hp" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "PlayerInGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerInGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayerInGame_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlayInGame" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER NOT NULL,
    "play" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "PlayInGame_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerInGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PlayInGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tank" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "agility" INTEGER NOT NULL DEFAULT 1,
    "armor" INTEGER NOT NULL DEFAULT 1,
    "accuracy" INTEGER NOT NULL DEFAULT 1,
    "attackPower" INTEGER NOT NULL DEFAULT 1,
    "color" TEXT NOT NULL DEFAULT '353f4a'
);
INSERT INTO "new_Tank" ("accuracy", "agility", "armor", "attackPower", "color", "id") SELECT "accuracy", "agility", "armor", "attackPower", "color", "id" FROM "Tank";
DROP TABLE "Tank";
ALTER TABLE "new_Tank" RENAME TO "Tank";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);
INSERT INTO "new_User" ("id", "password", "username") SELECT "id", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_Board" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT '[]',
    CONSTRAINT "Board_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Board" ("gameId", "id", "state") SELECT "gameId", "id", "state" FROM "Board";
DROP TABLE "Board";
ALTER TABLE "new_Board" RENAME TO "Board";
CREATE UNIQUE INDEX "Board_gameId_key" ON "Board"("gameId");
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'lobby',
    "adminId" INTEGER NOT NULL,
    "started_at" DATETIME,
    "ended_at" DATETIME,
    CONSTRAINT "Game_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("code", "ended_at", "id", "started_at", "state") SELECT "code", "ended_at", "id", "started_at", "state" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_code_key" ON "Game"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "PlayerInGame_gameId_userId_key" ON "PlayerInGame"("gameId", "userId");
