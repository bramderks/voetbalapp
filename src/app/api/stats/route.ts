import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    // ==========================================================
    // SPELERS
    // ==========================================================

    const players = await prisma.player.findMany({
      orderBy: {
        name: "asc",
      },
    });

    // ==========================================================
    // ALLEEN GESLOTEN ACTIVITEITEN
    //
    // Een activiteit telt pas mee voor de definitieve
    // statistieken wanneer deze is vergrendeld.
    // ==========================================================

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

    // ==========================================================
    // STATISTIEKEN PER SPELER
    // ==========================================================

    const result = players.map((player) => {
      // --------------------------------------------------------
      // TRAININGEN
      // --------------------------------------------------------

      const trainingen = activiteiten.filter(
        (activity) => activity.type === "TRAINING"
      );

      const trainingPresent = trainingen.filter((activity) =>
        activity.attendance.some(
          (attendance) =>
            attendance.playerId === player.id &&
            attendance.present === true
        )
      ).length;

      // --------------------------------------------------------
      // WEDSTRIJDEN
      // --------------------------------------------------------

      const wedstrijden = activiteiten.filter(
        (activity) => activity.type === "MATCH"
      );

      const matchPresent = wedstrijden.filter((activity) =>
        activity.attendance.some(
          (attendance) =>
            attendance.playerId === player.id &&
            attendance.present === true
        )
      ).length;

      // --------------------------------------------------------
      // GOALS
        //
        // Alleen MatchStat-records van gesloten wedstrijden
        // worden meegenomen.
        // --------------------------------------------------------

      const goals = wedstrijden.reduce((total, activity) => {
        const stats = activity.matchStats.find(
          (stat) => stat.playerId === player.id
        );

        return total + (stats?.goals ?? 0);
      }, 0);

      // --------------------------------------------------------
      // ASSISTS
      // --------------------------------------------------------

      const assists = wedstrijden.reduce((total, activity) => {
        const stats = activity.matchStats.find(
          (stat) => stat.playerId === player.id
        );

        return total + (stats?.assists ?? 0);
      }, 0);

      return {
        playerId: player.id,
        name: player.name,

        trainingTotal: trainingen.length,
        trainingPresent,

        matchTotal: wedstrijden.length,
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