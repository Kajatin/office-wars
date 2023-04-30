-- CreateTable
CREATE TABLE "Turn" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "move" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    "current" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Turn_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Turn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'lobby',
    "started_at" DATETIME,
    "ended_at" DATETIME,
    "curr_player" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Game" ("code", "ended_at", "id", "started_at", "state") SELECT "code", "ended_at", "id", "started_at", "state" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_code_key" ON "Game"("code");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
