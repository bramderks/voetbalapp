import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Check of team al bestaat
  let team = await prisma.team.findFirst({
    where: { name: "SCE JO8-1" },
  });

  // Zo niet → aanmaken
  if (!team) {
    team = await prisma.team.create({
      data: { name: "SCE JO8-1" },
    });
  }

  // Voorbeeldspelers (later via UI beheren)
  const spelersNamen = ["Tobi", "Sem", "Milan", "Lucas"];

  for (const name of spelersNamen) {
    const existing = await prisma.player.findFirst({
      where: { name, teamId: team.id },
    });

    if (!existing) {
      await prisma.player.create({
        data: {
          name,
          teamId: team.id,
        },
      });
    }
  }

  console.log("Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
