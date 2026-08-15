// One-off export of the existing SQLite data, run BEFORE switching schema.prisma to Postgres.
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.team.findMany();
  const players = await prisma.player.findMany();
  const activities = await prisma.activity.findMany();
  const attendances = await prisma.attendance.findMany();
  const matchStats = await prisma.matchStat.findMany();

  const dump = { teams, players, activities, attendances, matchStats };
  const outPath = path.join(process.cwd(), 'prisma', 'seed-data.json');
  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2));

  console.log(
    `Exported ${teams.length} teams, ${players.length} players, ${activities.length} activities, ${attendances.length} attendances, ${matchStats.length} matchStats to ${outPath}`
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
