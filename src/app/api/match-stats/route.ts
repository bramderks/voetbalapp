import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const activityId = Number(body.activityId);
    const playerId = Number(body.playerId);
    const goals = Number(body.goals);
    const assists = Number(body.assists);

    // ==========================================================
    // VALIDATIE ID'S
    // ==========================================================

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig activityId.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(playerId) || playerId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig playerId.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // VALIDATIE STATISTIEKEN
    // ==========================================================

    if (!Number.isInteger(goals) || goals < 0) {
      return NextResponse.json(
        {
          error: "Goals moet een geheel getal van 0 of hoger zijn.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(assists) || assists < 0) {
      return NextResponse.json(
        {
          error: "Assists moet een geheel getal van 0 of hoger zijn.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // ACTIVITEIT OPHALEN
    // ==========================================================

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        {
          error: "Activiteit niet gevonden.",
        },
        { status: 404 }
      );
    }

    // ==========================================================
    // ALLEEN WEDSTRIJDEN
    // ==========================================================

    if (activity.type !== "MATCH") {
      return NextResponse.json(
        {
          error:
            "Wedstrijdstatistieken kunnen alleen bij wedstrijden worden opgeslagen.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // LOCK CONTROLE
    //
    // Na het sluiten zijn goals en assists definitief.
    // ==========================================================

    if (activity.locked) {
      return NextResponse.json(
        {
          error:
            "Deze wedstrijd is gesloten. Goals en assists kunnen niet meer worden gewijzigd.",
        },
        { status: 409 }
      );
    }

    // ==========================================================
    // SPELER OPHALEN
    // ==========================================================

    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player) {
      return NextResponse.json(
        {
          error: "Speler niet gevonden.",
        },
        { status: 404 }
      );
    }

    // ==========================================================
    // TEAM CONTROLE
    // ==========================================================

    if (player.teamId !== activity.teamId) {
      return NextResponse.json(
        {
          error:
            "Deze speler hoort niet bij het team van deze wedstrijd.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // MATCH STAT OPSLAAN
    // ==========================================================

    const stats = await prisma.matchStat.upsert({
      where: {
        playerId_activityId: {
          playerId,
          activityId,
        },
      },

      update: {
        goals,
        assists,
      },

      create: {
        activityId,
        playerId,
        goals,
        assists,
      },
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("POST /api/match-stats error:", error);

    return NextResponse.json(
      {
        error:
          "Wedstrijdstatistieken konden niet worden opgeslagen.",
      },
      { status: 500 }
    );
  }
}