import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1. Team
  const team = await prisma.team.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "SCE JO8-1",
    },
  });

// 2. Spelers (jouw echte namen)
const spelersNamen = [
  "Tobi",
  "Joa",
  "Muad",
  "Mahmoud",
  "Eymen",
  "Romy",
  "Jamie",
  "Moussa",
];

// Eerst alle spelers verwijderen
await prisma.player.deleteMany({});

// Daarna opnieuw aanmaken
for (const name of spelersNamen) {
  await prisma.player.create({
    data: {
      name,
      teamId: team.id,
    },
  });
}


  // 3. Trainingen
  // Eerst alles leeggooien
  await prisma.activity.deleteMany({ where: { type: "training" } });

  // Dinsdag 18 augustus 2026
  await prisma.activity.create({
    data: {
      type: "training",
      date: "2026-08-18",
      startTime: "15:00",
      endTime: "16:00",
    },
  });

  // Donderdag 20 augustus 2026
  await prisma.activity.create({
    data: {
      type: "training",
      date: "2026-08-20",
      startTime: "15:00",
      endTime: "16:00",
    },
  });

  // Daarna iedere woensdag 15:00–16:00 tot eind juni 2027
  const endTrainingDate = new Date(2027, 5, 30); // 30 juni 2027
  let d = new Date(2026, 7, 21); // start rond eind augustus 2026

  while (d <= endTrainingDate) {
    if (d.getDay() === 3) {
      const iso = d.toISOString().split("T")[0];
      await prisma.activity.create({
        data: {
          type: "training",
          date: iso,
          startTime: "15:00",
          endTime: "16:00",
        },
      });
    }
    d.setDate(d.getDate() + 1);
  }

  // 4. Wedstrijden
  // Eerst alle wedstrijden leeggooien
  await prisma.activity.deleteMany({ where: { type: "match" } });

  // Wedstrijden iedere zaterdag 10:00–11:00 van september 2026 t/m juni 2027
  const startMatchDate = new Date(2026, 8, 1); // 1 september 2026
  const endMatchDate = new Date(2027, 5, 30);  // 30 juni 2027

  let m = new Date(startMatchDate);

  while (m <= endMatchDate) {
    if (m.getDay() === 6) {
      const iso = m.toISOString().split("T")[0];
      await prisma.activity.create({
        data: {
          type: "match",
          date: iso,
          startTime: "10:00",
          endTime: "11:00",
          location: "Sportpark SCE",
          opponent: "Tegenstander",
        },
      });
    }
    m.setDate(m.getDate() + 1);
  }

  console.log("Seed klaar: team, spelers, trainingen, wedstrijden.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
