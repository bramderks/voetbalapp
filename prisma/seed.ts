import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingTeam = await prisma.team.findFirst();
  if (existingTeam) {
    console.log('Seed already exists. Skipping.');
    return;
  }

  const team = await prisma.team.create({
    data: {
      name: 'SCE JO8-1',
    },
  });

  const players = [
    'Tobi',
    'Sem',
    'Milan',
    'Lucas',
  ];

  for (const playerName of players) {
    await prisma.player.create({
      data: {
        name: playerName,
        teamId: team.id,
      },
    });
  }

  const baseDate = '2026-08-24';
  const training = await prisma.activity.create({
    data: {
      date: baseDate,
      type: 'TRAINING',
      startTime: '15:00',
      endTime: '16:00',
      location: 'Sportpark de Burcht',
      opponent: null,
      status: 'registered',
    },
  });

  const playersFromDb = await prisma.player.findMany({ where: { teamId: team.id } });
  for (const player of playersFromDb) {
    await prisma.attendance.create({
      data: {
        activityId: training.id,
        playerId: player.id,
        present: true,
      },
    });
  }

  const matchDate = '2026-08-29';
  await prisma.activity.create({
    data: {
      date: matchDate,
      type: 'MATCH',
      startTime: '18:30',
      endTime: '19:45',
      opponent: 'SV De Meern',
      location: 'Sportpark Noord',
      status: 'registered',
    },
  });

  console.log('Database seeded with team and players.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
