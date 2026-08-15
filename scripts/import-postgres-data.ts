// Run this AFTER schema.prisma points to Postgres and DATABASE_URL/DIRECT_URL are set,
// and after `npx prisma migrate deploy` has created the tables.
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

type Dump = {
  teams: { id: number; name: string }[];
  players: { id: number; name: string; teamId: number }[];
  activities: {
    id: number;
    date: string;
    type: string;
    startTime: string;
    endTime: string;
    opponent: string | null;
    location: string | null;
    status: string;
  }[];
  attendances: { id: number; activityId: number; playerId: number; present: boolean }[];
  matchStats: { id: number; activityId: number; playerId: number; goals: number; assists: number }[];
};

async function main() {
  const dumpPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  const dump: Dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));

  for (const team of dump.teams) {
    await prisma.team.create({ data: team });
  }
  for (const player of dump.players) {
    await prisma.player.create({ data: player });
  }
  for (const activity of dump.activities) {
    await prisma.activity.create({ data: activity });
  }
  for (const attendance of dump.attendances) {
    await prisma.attendance.create({ data: attendance });
  }
  for (const matchStat of dump.matchStats) {
    await prisma.matchStat.create({ data: matchStat });
  }

  // Reset auto-increment sequences so future inserts don't collide with imported IDs.
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Team"', 'id'), COALESCE((SELECT MAX(id) FROM "Team"), 1))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Player"', 'id'), COALESCE((SELECT MAX(id) FROM "Player"), 1))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Activity"', 'id'), COALESCE((SELECT MAX(id) FROM "Activity"), 1))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Attendance"', 'id'), COALESCE((SELECT MAX(id) FROM "Attendance"), 1))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"MatchStat"', 'id'), COALESCE((SELECT MAX(id) FROM "MatchStat"), 1))`);

  console.log(
    `Imported ${dump.teams.length} teams, ${dump.players.length} players, ${dump.activities.length} activities, ${dump.attendances.length} attendances, ${dump.matchStats.length} matchStats into Postgres.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
