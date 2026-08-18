import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const activityId = Number(body.activityId);
    const playerId = Number(body.playerId);

    if (typeof body.present !== "boolean") {
      return NextResponse.json(
        {
          error: "present moet true of false zijn.",
        },
        { status: 400 }
      );
    }

    const present = body.present;

    // ==========================================================
    // VALIDATIE ACTIVITY
    // ==========================================================

    if (!Number.isInteger(activityId) || activityId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig activityId.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // VALIDATIE PLAYER
    // ==========================================================

    if (!Number.isInteger(playerId) || playerId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig playerId.",
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
    // LOCK CONTROLE
    //
    // Dit is de daadwerkelijke beveiliging.
    // Een gesloten activiteit kan nooit meer worden aangepast.
    // ==========================================================

    if (activity.locked) {
      return NextResponse.json(
        {
          error:
            "Deze activiteit is gesloten. Aanwezigheid kan niet meer worden gewijzigd.",
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
            "Deze speler hoort niet bij het team van deze activiteit.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // BESTAANDE ATTENDANCE
    //
    // We gebruiken bewust findFirst.
    //
    // De database kan op dit moment nog dubbele attendance
    // records bevatten. Zodra die opgeschoond zijn kunnen we
    // eventueel overstappen naar een samengestelde unique key.
    // ==========================================================

    const existing = await prisma.attendance.findFirst({
      where: {
        activityId,
        playerId,
      },
      orderBy: {
        id: "asc",
      },
    });

    // ==========================================================
    // BESTAAND RECORD BIJWERKEN
    // ==========================================================

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

    // ==========================================================
    // NIEUW RECORD AANMAKEN
    // ==========================================================

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

    return NextResponse.json(created, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST /api/attendance/update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Aanwezigheid kon niet worden bijgewerkt.",
      },
      { status: 500 }
    );
  }
}