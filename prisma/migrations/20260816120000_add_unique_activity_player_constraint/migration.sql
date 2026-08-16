-- CreateIndex
CREATE UNIQUE INDEX "Attendance_activityId_playerId_key" ON "Attendance"("activityId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchStat_activityId_playerId_key" ON "MatchStat"("activityId", "playerId");
