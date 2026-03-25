-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "currentTopic" TEXT NOT NULL DEFAULT '',
    "roundStartedAt" TEXT NOT NULL,
    "revealed" BOOLEAN NOT NULL DEFAULT false,
    "historyJson" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isHost" BOOLEAN NOT NULL DEFAULT false,
    "isSpectator" BOOLEAN NOT NULL DEFAULT false,
    "vote" TEXT,
    "voteChanged" BOOLEAN NOT NULL DEFAULT false,
    "roomId" TEXT NOT NULL,
    CONSTRAINT "Participant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Participant_roomId_idx" ON "Participant"("roomId");
