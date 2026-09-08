-- Rename the existing player record in place so the player ID and all
-- related attendance, statistics and match-stat records remain unchanged.
UPDATE "Player"
SET "name" = 'Lorenz'
WHERE "name" = 'Jamie'
  AND NOT EXISTS (
    SELECT 1
    FROM "Player" existing_lorenz
    WHERE existing_lorenz."teamId" = "Player"."teamId"
      AND existing_lorenz."name" = 'Lorenz'
  );