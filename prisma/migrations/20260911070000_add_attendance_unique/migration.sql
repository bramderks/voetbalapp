-- Keep the newest attendance record when legacy duplicate rows exist.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "activityId", "playerId"
      ORDER BY id DESC
    ) AS row_number
  FROM "Attendance"
)
DELETE FROM "Attendance" AS attendance
USING ranked
WHERE attendance.id = ranked.id
  AND ranked.row_number > 1;

-- Enforce the one-record-per-player-per-activity invariant.
CREATE UNIQUE INDEX "Attendance_activityId_playerId_key"
ON "Attendance"("activityId", "playerId");
