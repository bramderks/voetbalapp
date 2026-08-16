import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // TEAM
  const team = await prisma.team.create({
    data: { name: "SCE JO8-1" },
  });

  // SPELERS
  const spelers = await Promise.all(
    [
      "Tobi","Sem","Milan","Lucas","Daan","Finn","Noah",
      "Jesse","Thijs","Ruben","Lars","Tom","Niek","Gijs"
    ].map((naam) =>
      prisma.player.create({
        data: { name: naam, teamId: team.id },
      })
    )
  );

  // TRAININGEN: di 18 aug, do 20 aug, daarna elke woensdag
  const trainingen: any[] = [];

  // Eerste twee trainingen
  const eersteTrainingen = [
    "2026-08-18",
    "2026-08-20"
  ];

  for (const date of eersteTrainingen) {
    const t = await prisma.activity.create({
      data: {
        type: "TRAINING",
        date,
        startTime: "15:00",
        endTime: "16:00",
        status: "registered",
        location: "Sportpark SCE",
      },
    });
    trainingen.push(t);
  }

  // Daarna elke woensdag tot eind december
  const maanden = ["2026-08","2026-09","2026-10","2026-11","2026-12"];

  for (const maand of maanden) {
    for (let dag = 1; dag <= 31; dag++) {
      const date = `${maand}-${String(dag).padStart(2, "0")}`;
      const weekday = new Date(date).getDay();

      if (weekday === 3) { // woensdag
        const t = await prisma.activity.create({
          data: {
            type: "TRAINING",
            date,
            startTime: "15:00",
            endTime: "16:00",
            status: "registered",
            location: "Sportpark SCE",
          },
        });
        trainingen.push(t);
      }
    }
  }

  // WEDSTRIJDEN: elke zaterdag sep–dec
  const wedstrijden: any[] = [];
  const matchMonths = ["2026-09","2026-10","2026-11","2026-12"];

  for (const maand of matchMonths) {
    for (let dag = 1; dag <= 31; dag++) {
      const date = `${maand}-${String(dag).padStart(2, "0")}`;
      const weekday = new Date(date).getDay();

      if (weekday === 6) { // zaterdag
        const w = await prisma.activity.create({
          data: {
            type: "MATCH",
            date,
            startTime: "10:00",
            endTime: "11:00",
            status: "registered",
            opponent: "Tegenstander",
            location: "Sportpark SCE",
          },
        });
        wedstrijden.push(w);
      }
    }
  }

  // ATTENDANCE voor ALLE trainingen
  for (const training of trainingen) {
    for (const speler of spelers) {
      await prisma.attendance.create({
        data: {
          activityId: training.id,
          playerId: speler.id,
          present: true,
        },
      });
    }
  }

  // MATCHSTATS voor ALLE wedstrijden
  for (const wedstrijd of wedstrijden) {
    for (const speler of spelers.slice(0, 5)) {
      await prisma.matchStat.create({
        data: {
          activityId: wedstrijd.id,
          playerId: speler.id,
          goals: Math.floor(Math.random() * 3),
          assists: Math.floor(Math.random() * 2),
        },
      });
    }
  }

  console.log("Seizoen seed voltooid!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
