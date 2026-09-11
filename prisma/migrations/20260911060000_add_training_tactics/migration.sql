-- Persist the number of players used in a training tactic.
ALTER TABLE "Activity"
ADD COLUMN "tacticPlayerCount" INTEGER NOT NULL DEFAULT 8;

-- Persist every player's location for a training tactic.
CREATE TABLE "TacticPosition" (
  "id" SERIAL NOT NULL,
  "activityId" INTEGER NOT NULL,
  "playerId" INTEGER NOT NULL,
  "zone" TEXT NOT NULL DEFAULT 'POOL',
  "x" DOUBLE PRECISION NOT NULL DEFAULT 50,
  "y" DOUBLE PRECISION NOT NULL DEFAULT 50,
  "benchSlot" INTEGER,

  CONSTRAINT "TacticPosition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TacticPosition_activityId_playerId_key"
ON "TacticPosition"("activityId", "playerId");

CREATE INDEX "TacticPosition_activityId_idx"
ON "TacticPosition"("activityId");

CREATE INDEX "TacticPosition_playerId_idx"
ON "TacticPosition"("playerId");

CREATE INDEX "TacticPosition_activityId_zone_idx"
ON "TacticPosition"("activityId", "zone");

ALTER TABLE "TacticPosition"
ADD CONSTRAINT "TacticPosition_activityId_fkey"
FOREIGN KEY ("activityId") REFERENCES "Activity"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TacticPosition"
ADD CONSTRAINT "TacticPosition_playerId_fkey"
FOREIGN KEY ("playerId") REFERENCES "Player"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
