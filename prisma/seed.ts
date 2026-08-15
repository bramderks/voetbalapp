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

  // Eerste training: woensdag 26 augustus 2026, 15:00–16:00
  const trainingDate = '2026-08-26';
  const training = await prisma.activity.create({
    data: {
      date: trainingDate,
      type: 'TRAINING',
      startTime: '15:00',
      endTime: '16:00',
      opponent: null,
      location: null,
      status: 'OPEN',
    },
  });

  // Eerste wedstrijd: zaterdag 29 augustus 2026
  const matchDate = '2026-08-29';
  const match = await prisma.activity.create({
    data: {
      date: matchDate,
      type: 'MATCH',
      startTime: '10:00',
      endTime: '11:15',
      opponent: null,
      location: null,
      status: 'OPEN',
    },
  });

  console.log('Database seeded with team, players, and activities.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
