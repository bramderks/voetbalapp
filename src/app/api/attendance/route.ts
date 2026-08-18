import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const activityId = Number(body.activityId);
    const playerId = Number(body.playerId);
    const present = Boolean(body.present);

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json(
        { error: "Ongeldig activityId." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(playerId) || playerId <= 0) {
      return NextResponse.json(
        { error: "Ongeldig playerId." },
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
        { error: "Activiteit niet gevonden." },
        { status: 404 }
      );
    }

    /*
     * Een gesloten training of wedstrijd mag nooit meer
     * worden aangepast.
     */
    if (activity.locked) {
      return NextResponse.json(
        {
          error:
            "Deze activiteit is gesloten. Aanwezigheid kan niet meer worden gewijzigd.",
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
        { error: "Speler niet gevonden." },
        { status: 404 }
      );
    }

    /*
     * Een speler kan alleen aanwezigheid registreren
     * voor activiteiten van zijn eigen team.
     */
    if (player.teamId !== activity.teamId) {
      return NextResponse.json(
        {
          error:
            "Deze speler hoort niet bij het team van deze activiteit.",
        },
        { status: 400 }
      );
    }

    /*
     * We gebruiken bewust findFirst in plaats van upsert.
     *
     * De database bevat mogelijk nog dubbele oude records.
     * Zodra we die opgeschoond hebben, kunnen we een unieke
     * constraint toevoegen.
     */
    const existing = await prisma.attendance.findFirst({
      where: {
        activityId,
        playerId,
      },
      orderBy: {
        id: "asc",
      },
    });

    if (existing) {
      const updated = await prisma.attendance.update({
        where: {
          id: existing.id,
        },
        data: {
          present,
        },
        include: {
          player: true,
          activity: true,
        },
      });

      return NextResponse.json(updated);
    }

    const created = await prisma.attendance.create({
      data: {
        activityId,
        playerId,
        present,
      },
      include: {
        player: true,
        activity: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance error:", error);

    return NextResponse.json(
      {
        error: "Aanwezigheid kon niet worden opgeslagen.",
      },
      { status: 500 }
    );
  }
}