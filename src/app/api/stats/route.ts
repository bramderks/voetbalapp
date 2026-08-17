import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const players = await prisma.player.findMany();

  const activiteiten = await prisma.activity.findMany({
    include: {
      attendances: true,
      matchStats: true,
    },
  });

  const result = players.map((p) => {
    const trainingTotal = activiteiten.filter((a) => a.type === "TRAINING").length;
    const trainingPresent = activiteiten.filter(
      (a) =>
        a.type === "TRAINING" &&
        a.attendances.some((x) => x.playerId === p.id && x.present)
    ).length;

    const matchTotal = activiteiten.filter((a) => a.type === "MATCH").length;
    const matchPresent = activiteiten.filter(
      (a) =>
        a.type === "MATCH" &&
        a.matchStats.some((x) => x.playerId === p.id)
    ).length;

    const goals = activiteiten.reduce((acc, a) => {
      if (a.type !== "MATCH") return acc;
      const s = a.matchStats.find((x) => x.playerId === p.id);
      return acc + (s?.goals || 0);
    }, 0);

    const assists = activiteiten.reduce((acc, a) => {
      if (a.type !== "MATCH") return acc;
      const s = a.matchStats.find((x) => x.playerId === p.id);
      return acc + (s?.assists || 0);
    }, 0);

    return {
      playerId: p.id,
      name: p.name,
      trainingTotal,
      trainingPresent,
      matchTotal,
      matchPresent,
      goals,
      assists,
    };
  });

  return NextResponse.json(result);
}
