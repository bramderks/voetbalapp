import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//
// SEIZOEN GENERATOR
//
function generateSeason(startDate: Date, endDate: Date, teamId: number) {
  const activities = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay(); // 3 = woensdag, 6 = zaterdag

    // TRAINING — elke woensdag
    if (day === 3) {
      activities.push({
        type: "TRAINING",
        date: current.toISOString(),
        startTime: "15:00",
        endTime: "16:00",
        teamId,
      });
    }

    // WEDSTRIJD — elke zaterdag
    if (day === 6) {
      activities.push({
        type: "MATCH",
        date: current.toISOString(),
        startTime: "10:00",
        endTime: "11:30",
        opponent: null,
        home: null,
        teamId,
      });
    }

    current.setDate(current.getDate() + 1);
  }

  return activities;
}

async function main() {
  console.log("🌱 Seeding database...");

  //
  // TEAM
  //
  const team = await prisma.team.create({
    data: {
      name: "SCE JO11-1",
      season: "26-27",
    },
  });

  //
  // PLAYERS
  //
  const playerNames = [
    "Eymen",
    "Jamie",
    "Joa",
    "Mahmoud",
    "Moussa",
    "Muad",
    "Romy",
    "Tobi",
  ];

  await prisma.player.createMany({
    data: playerNames.map((name) => ({
      name,
      teamId: team.id,
    })),
  });

  const players = await prisma.player.findMany();

  //
  // ACTIVITEITEN (trainingen + wedstrijden automatisch)
  //
  const seasonActivities = generateSeason(
    new Date("2026-08-24"),
    new Date("2027-06-30"),
    team.id
  );

  await prisma.activity.createMany({
    data: seasonActivities,
  });

  const activities = await prisma.activity.findMany();

  //
  // PLAYER STATS
  //
  await prisma.playerStats.createMany({
    data: players.map((p) => ({
      playerId: p.id,
      goals: 0,
      assists: 0,
      present: 0,
    })),
  });

  //
  // ATTENDANCE (voor elke speler × elke activiteit)
  //
  await prisma.attendance.createMany({
    data: activities.flatMap((activity) =>
      players.map((player) => ({
        playerId: player.id,
        activityId: activity.id,
        present: false,
      }))
    ),
  });

  console.log("🌱 Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
