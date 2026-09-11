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
            "Deze speler hoort niet bij het team van deze activiteit.",
        },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        activityId_playerId: {
          activityId,
          playerId,
        },
      },
      update: {
        present,
      },
      create: {
        activityId,
        playerId,
        present,
      },
      include: {
        player: true,
        activity: true,
      },
    });

    return NextResponse.json(attendance);
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
