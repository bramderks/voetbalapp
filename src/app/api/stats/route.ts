import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    });

    const activiteiten = await prisma.activity.findMany({
      where: {
        locked: true,
      },
      include: {
        attendance: true,
        matchStats: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const trainingen = activiteiten.filter(
      (activity) => activity.type === "TRAINING"
    );

    const wedstrijden = activiteiten.filter(
      (activity) => activity.type === "MATCH"
    );

    const trainingIds = new Set(
      trainingen.map((training) => training.id)
    );

    const matchIds = new Set(
      wedstrijden.map((wedstrijd) => wedstrijd.id)
    );

    const result = players.map((player) => {
      const trainingPresent = trainingen.filter((activity) =>
        activity.attendance.some(
          (attendance) =>
            attendance.playerId === player.id &&
            attendance.present === true
        )
      ).length;

      const matchPresent = wedstrijden.filter((activity) =>
        activity.attendance.some(
          (attendance) =>
            attendance.playerId === player.id &&
            attendance.present === true
        )
      ).length;

      const goals = wedstrijden.reduce((total, activity) => {
        const stats = activity.matchStats.find(
          (stat) => stat.playerId === player.id
        );

        return total + (stats?.goals ?? 0);
      }, 0);

      const assists = wedstrijden.reduce((total, activity) => {
        const stats = activity.matchStats.find(
          (stat) => stat.playerId === player.id
        );

        return total + (stats?.assists ?? 0);
      }, 0);

      return {
        playerId: player.id,
        name: player.name,

        trainingTotal: trainingIds.size,
        trainingPresent,

        matchTotal: matchIds.size,
        matchPresent,

        goals,
        assists,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/stats error:", error);

    return NextResponse.json(
      {
        error: "Statistieken konden niet worden opgehaald.",
      },
      {
        status: 500,
      }
    );
  }
}
