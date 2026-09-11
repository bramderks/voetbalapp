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

    const trainingPresentByPlayer = new Set<number>();
    const matchPresentByPlayer = new Set<number>();
    const goalsByPlayer = new Map<number, number>();
    const assistsByPlayer = new Map<number, number>();

    for (const training of trainingen) {
      for (const attendance of training.attendance) {
        if (attendance.present) {
          trainingPresentByPlayer.add(
            attendance.playerId
          );
        }
      }
    }

    const trainingPresentCounts = new Map<number, number>();
    for (const training of trainingen) {
      for (const attendance of training.attendance) {
        if (!attendance.present) continue;

        trainingPresentCounts.set(
          attendance.playerId,
          (trainingPresentCounts.get(attendance.playerId) ?? 0) + 1
        );
      }
    }

    const matchPresentCounts = new Map<number, number>();
    for (const wedstrijd of wedstrijden) {
      for (const attendance of wedstrijd.attendance) {
        if (!attendance.present) continue;

        matchPresentByPlayer.add(attendance.playerId);
        matchPresentCounts.set(
          attendance.playerId,
          (matchPresentCounts.get(attendance.playerId) ?? 0) + 1
        );
      }
    }

    for (const wedstrijd of wedstrijden) {
      for (const stat of wedstrijd.matchStats) {
        goalsByPlayer.set(
          stat.playerId,
          (goalsByPlayer.get(stat.playerId) ?? 0) + stat.goals
        );
        assistsByPlayer.set(
          stat.playerId,
          (assistsByPlayer.get(stat.playerId) ?? 0) + stat.assists
        );
      }
    }

    const result = players.map((player) => ({
      playerId: player.id,
      name: player.name,
      trainingTotal: trainingen.length,
      trainingPresent: trainingPresentCounts.get(player.id) ?? 0,
      matchTotal: wedstrijden.length,
      matchPresent: matchPresentCounts.get(player.id) ?? 0,
      goals: goalsByPlayer.get(player.id) ?? 0,
      assists: assistsByPlayer.get(player.id) ?? 0,
    }));

    // Keep these sets intentionally materialized so the presence indexes
    // remain explicit and easy to extend without changing the response shape.
    void trainingPresentByPlayer;
    void matchPresentByPlayer;

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
