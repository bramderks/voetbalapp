import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function saveMatchStat(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const params = await context.params;

    const activityIdFromParams = Number(params.id);

    const body = await req.json();

    const activityId =
      Number.isInteger(activityIdFromParams) && activityIdFromParams > 0
        ? activityIdFromParams
        : Number(body.activityId);

    const playerId = Number(body.playerId);
    const goals = Number(body.goals);
    const assists = Number(body.assists);

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

    const activity = await prisma.activity.findUnique({
      where: {
        id: activityId,
      },
    });

    if (!activity) {
      return NextResponse.json(
        {
          error: "Wedstrijd niet gevonden.",
        },
        { status: 404 }
      );
    }

    if (activity.type !== "MATCH") {
      return NextResponse.json(
        {
          error:
            "Wedstrijdstatistieken kunnen alleen bij wedstrijden worden opgeslagen.",
        },
        { status: 400 }
      );
    }

    if (activity.locked) {
      return NextResponse.json(
        {
          error:
            "Deze wedstrijd is gesloten. De statistieken kunnen niet meer worden gewijzigd.",
        },
        { status: 409 }
      );
    }

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

    if (player.teamId !== activity.teamId) {
      return NextResponse.json(
        {
          error:
            "Deze speler hoort niet bij het team van deze wedstrijd.",
        },
        { status: 400 }
      );
    }

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
        playerId,
        activityId,
        goals,
        assists,
      },
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error("match stat save error:", error);

    return NextResponse.json(
      {
        error:
          "Wedstrijdstatistieken konden niet worden opgeslagen.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return saveMatchStat(req, context);
}

export async function PUT(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return saveMatchStat(req, context);
}

export async function PATCH(
  req: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  return saveMatchStat(req, context);
}