import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const activityId = Number(body.activityId);
    const playerId = Number(body.playerId);

    const present =
      body.present === true ||
      body.present === "true";

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

    if (activity.type !== "TRAINING") {
      return NextResponse.json(
        {
          error: "Deze activiteit is geen training.",
        },
        { status: 400 }
      );
    }

    if (activity.locked) {
      return NextResponse.json(
        {
          error:
            "Deze training is gesloten. Aanwezigheid kan niet meer worden gewijzigd.",
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

    if (player.teamId !== activity.teamId) {
      return NextResponse.json(
        {
          error:
            "Deze speler hoort niet bij het team van deze training.",
        },
        { status: 400 }
      );
    }

    const existing = await prisma.attendance.findFirst({
      where: {
        playerId,
        activityId,
      },
    });

    let attendance;

    if (existing) {
      attendance = await prisma.attendance.update({
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
    } else {
      attendance = await prisma.attendance.create({
        data: {
          playerId,
          activityId,
          present,
        },
        include: {
          player: true,
          activity: true,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error(
      "POST /api/training/attendance error:",
      error
    );

    return NextResponse.json(
      {
        error: "Aanwezigheid kon niet worden opgeslagen.",
      },
      { status: 500 }
    );
  }
}