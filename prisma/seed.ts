import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to format time as HH:mm
function formatTime(hours: number, minutes: number = 0): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

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
    'Joa',
    'Muad',
    'Moussa',
    'Eymen',
    'Jamie',
    'Romy',
    'Mahmoud',
  ];

  for (const playerName of players) {
    await prisma.player.create({
      data: {
        name: playerName,
        teamId: team.id,
      },
    });
  }

  // Generate season 2026-2027
  // Trainings: every Wednesday from 26 Aug 2026 to 31 May 2027
  // Matches: every Saturday from 24 Aug 2026 to 29 May 2027

  const seasonStart = new Date(2026, 7, 24); // 24 August 2026 (Saturday)
  const seasonEnd = new Date(2027, 4, 31); // End of May 2027

  // Generate all Wednesdays (trainings)
  let currentTrainingDate = new Date(2026, 7, 26); // First Wednesday: 26 August 2026
  while (currentTrainingDate <= seasonEnd) {
    if (currentTrainingDate.getDay() === 3) { // Wednesday = 3
      const dateStr = formatDate(currentTrainingDate);
      await prisma.activity.create({
        data: {
          date: dateStr,
          type: 'TRAINING',
          startTime: formatTime(15),
          endTime: formatTime(16),
          opponent: null,
          location: null,
          status: 'OPEN',
        },
      });
    }
    currentTrainingDate.setDate(currentTrainingDate.getDate() + 1);
  }

  // Generate all Saturdays (matches)
  let currentMatchDate = new Date(2026, 7, 24); // First Saturday: 24 August 2026
  while (currentMatchDate <= seasonEnd) {
    if (currentMatchDate.getDay() === 6) { // Saturday = 6
      const dateStr = formatDate(currentMatchDate);
      await prisma.activity.create({
        data: {
          date: dateStr,
          type: 'MATCH',
          startTime: formatTime(10),
          endTime: formatTime(11, 15),
          opponent: null,
          location: null,
          status: 'OPEN',
        },
      });
    }
    currentMatchDate.setDate(currentMatchDate.getDate() + 1);
  }

  const trainingCount = await prisma.activity.count({ where: { type: 'TRAINING' } });
  const matchCount = await prisma.activity.count({ where: { type: 'MATCH' } });
  console.log(`Database seeded: ${trainingCount} trainings, ${matchCount} matches, ${players.length} players in team SCE JO8-1.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
