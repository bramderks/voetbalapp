import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * Haalt alle trainingen op.
 *
 * Optioneel:
 * /api/training?teamId=1
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get("teamId");

    let teamId: number | undefined;

    if (teamIdParam) {
      const parsedTeamId = Number(teamIdParam);

      if (!Number.isInteger(parsedTeamId) || parsedTeamId <= 0) {
        return NextResponse.json(
          { error: "Ongeldig teamId." },
          { status: 400 }
        );
      }

      teamId = parsedTeamId;
    }

    const trainings = await prisma.activity.findMany({
      where: {
        type: "TRAINING",
        ...(teamId !== undefined ? { teamId } : {}),
      },
      orderBy: [
        {
          date: "asc",
        },
        {
          startTime: "asc",
        },
      ],
      include: {
        team: true,
      },
    });

    return NextResponse.json(trainings);
  } catch (error) {
    console.error("GET /api/training error:", error);

    return NextResponse.json(
      { error: "Trainingen konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}


/**
 * POST
 *
 * Maakt handmatig één training aan.
 *
 * Verplicht:
 * - date
 * - startTime
 * - endTime
 * - teamId
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

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
    console.error("POST /api/training error:", error);

    return NextResponse.json(
      { error: "Training kon niet worden aangemaakt." },
      { status: 500 }
    );
  }
}