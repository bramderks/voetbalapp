import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = String(body.date ?? "").trim();
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim();
    const teamId = Number(body.teamId);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: "Datum moet het formaat YYYY-MM-DD hebben." },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(startTime)) {
      return NextResponse.json(
        { error: "Begintijd moet het formaat HH:mm hebben." },
        { status: 400 }
      );
    }

    if (!/^\d{2}:\d{2}$/.test(endTime)) {
      return NextResponse.json(
        { error: "Eindtijd moet het formaat HH:mm hebben." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(teamId) || teamId <= 0) {
      return NextResponse.json(
        { error: "Een geldig teamId is verplicht." },
        { status: 400 }
      );
    }

    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team niet gevonden." },
        { status: 404 }
      );
    }

    const training = await prisma.activity.create({
      data: {
        type: "TRAINING",
        date,
        startTime,
        endTime,
        teamId,
        opponent: null,
        home: null,
        locked: false,
        lockedAt: null,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("POST /api/training/create error:", error);

    return NextResponse.json(
      { error: "Training kon niet worden aangemaakt." },
      { status: 500 }
    );
  }
}