import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEASON = "26-27";
const TEAM_NAME = "SCE JO8-1";

const TRAINING_START_TIME = "15:00";
const TRAINING_END_TIME = "16:00";

const MATCH_START_TIME = "10:00";
const MATCH_END_TIME = "11:30";

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

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Genereert alle vaste trainingen van het seizoen.
 *
 * Eerste week:
 * - dinsdag 18 augustus 2026
 * - donderdag 20 augustus 2026
 *
 * Daarna:
 * - iedere woensdag
 *
 * Einddatum:
 * - 31 mei 2027
 */
function generateTrainingDates() {
  const dates: string[] = [];

  const firstTrainingDates = [
    new Date(2026, 7, 18),
    new Date(2026, 7, 20),
  ];

  for (const date of firstTrainingDates) {
    dates.push(toDateString(date));
  }

  const firstWednesday = new Date(2026, 7, 26);
  const endDate = new Date(2027, 4, 31);

  const current = new Date(firstWednesday);

  while (current <= endDate) {
    dates.push(toDateString(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

/**
 * Genereert iedere zaterdag een wedstrijd
 * vanaf de start van het seizoen tot en met eind mei.
 */
function generateMatchDates() {
  const dates: string[] = [];

  const firstSaturday = new Date(2026, 7, 22);
  const endDate = new Date(2027, 4, 31);

  const current = new Date(firstSaturday);

  while (current <= endDate) {
    dates.push(toDateString(current));
    current.setDate(current.getDate() + 7);
  }

  return dates;
}

async function main() {
  console.log("🌱 Seeding database...");

  /**
   * ============================================================
   * TEAM
   * ============================================================
   *
   * We gebruiken het bestaande team als het al bestaat.
   * Hierdoor maakt opnieuw seeden geen dubbele teams aan.
   */
  let team = await prisma.team.findFirst({
    where: {
      name: TEAM_NAME,
      season: SEASON,
    },
  });

  if (!team) {
    team = await prisma.team.create({
      data: {
        name: TEAM_NAME,
        season: SEASON,
      },
    });

    console.log(`✅ Team aangemaakt: ${team.name}`);
  } else {
    console.log(`ℹ️ Team bestaat al: ${team.name}`);
  }

  /**
   * ============================================================
   * PLAYERS
   * ============================================================
   *
   * Alleen spelers aanmaken die nog niet bestaan binnen dit team.
   */
  for (const name of playerNames) {
    const existingPlayer = await prisma.player.findFirst({
      where: {
        name,
        teamId: team.id,
      },
    });

    if (!existingPlayer) {
      await prisma.player.create({
        data: {
          name,
          teamId: team.id,
        },
      });

      console.log(`✅ Speler aangemaakt: ${name}`);
    }
  }

  const players = await prisma.player.findMany({
    where: {
      teamId: team.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  /**
   * ============================================================
   * TRAININGEN
   * ============================================================
   */
  const trainingDates = generateTrainingDates();

  for (const date of trainingDates) {
    const existingTraining = await prisma.activity.findFirst({
      where: {
        teamId: team.id,
        type: "TRAINING",
        date,
        startTime: TRAINING_START_TIME,
        endTime: TRAINING_END_TIME,
      },
    });

    if (!existingTraining) {
      await prisma.activity.create({
        data: {
          type: "TRAINING",
          date,
          startTime: TRAINING_START_TIME,
          endTime: TRAINING_END_TIME,
          teamId: team.id,
        },
      });

      console.log(`✅ Training aangemaakt: ${date}`);
    }
  }

  /**
   * ============================================================
   * WEDSTRIJDEN
   * ============================================================
   *
   * Iedere zaterdag wordt één basiswedstrijd aangemaakt.
   *
   * Tegenstander en thuis/uit blijven leeg zodat deze later
   * vanuit de app ingevuld kunnen worden.
   */
  const matchDates = generateMatchDates();

  for (const date of matchDates) {
    const existingMatch = await prisma.activity.findFirst({
      where: {
        teamId: team.id,
        type: "MATCH",
        date,
        startTime: MATCH_START_TIME,
        endTime: MATCH_END_TIME,
      },
    });

    if (!existingMatch) {
      await prisma.activity.create({
        data: {
          type: "MATCH",
          date,
          startTime: MATCH_START_TIME,
          endTime: MATCH_END_TIME,
          opponent: null,
          home: null,
          teamId: team.id,
        },
      });

      console.log(`✅ Wedstrijd aangemaakt: ${date}`);
    }
  }

  /**
   * ============================================================
   * ACTIVITEITEN
   * ============================================================
   */
  const activities = await prisma.activity.findMany({
    where: {
      teamId: team.id,
    },
    orderBy: [
      {
        date: "asc",
      },
      {
        startTime: "asc",
      },
    ],
  });

  /**
   * ============================================================
   * PLAYER STATS
   * ============================================================
   *
   * Alleen aanmaken als de speler nog geen stats-record heeft.
   */
  for (const player of players) {
    const existingStats = await prisma.playerStats.findFirst({
      where: {
        playerId: player.id,
      },
    });

    if (!existingStats) {
      await prisma.playerStats.create({
        data: {
          playerId: player.id,
          goals: 0,
          assists: 0,
          present: 0,
        },
      });
    }
  }

  /**
   * ============================================================
   * ATTENDANCE
   * ============================================================
   *
   * Iedere speler krijgt voor iedere activiteit één
   * aanwezigheidsrecord.
   *
   * Bestaande records worden niet opnieuw aangemaakt.
   */
  for (const activity of activities) {
    for (const player of players) {
      const existingAttendance =
        await prisma.attendance.findFirst({
          where: {
            playerId: player.id,
            activityId: activity.id,
          },
        });

      if (!existingAttendance) {
        await prisma.attendance.create({
          data: {
            playerId: player.id,
            activityId: activity.id,
            present: false,
          },
        });
      }
    }
  }

  console.log("");
  console.log("🌱 Seed completed!");
  console.log(`👥 Team: ${team.name}`);
  console.log(`👤 Spelers: ${players.length}`);
  console.log(`🏃 Trainingen: ${trainingDates.length}`);
  console.log(`⚽ Wedstrijden: ${matchDates.length}`);
  console.log(`📅 Activiteiten totaal: ${activities.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });