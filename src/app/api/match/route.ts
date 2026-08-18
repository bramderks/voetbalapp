import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const matches = await prisma.activity.findMany({
      where: {
        type: "MATCH",
      },
      orderBy: [
        {
          date: "desc",
        },
        {
          startTime: "asc",
        },
      ],
      include: {
        team: true,
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/match error:", error);

    return NextResponse.json(
      {
        error: "Wedstrijden konden niet worden opgehaald.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const date = String(body.date ?? "");
    const startTime = String(body.startTime ?? "");
    const endTime = String(body.endTime ?? "");

    const opponent =
      typeof body.opponent === "string" && body.opponent.trim()
        ? body.opponent.trim()
        : null;

    const home =
      typeof body.home === "boolean"
        ? body.home
        : null;

    const requestedTeamId = Number(body.teamId);

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        {
          error: "Datum, begintijd en eindtijd zijn verplicht.",
        },
        { status: 400 }
      );
    }

    let teamId: number;

    if (Number.isInteger(requestedTeamId) && requestedTeamId > 0) {
      teamId = requestedTeamId;
    } else {
      const team = await prisma.team.findFirst({
        orderBy: {
          id: "asc",
        },
      });

      if (!team) {
        return NextResponse.json(
          {
            error: "Er is nog geen team aangemaakt.",
          },
          { status: 400 }
        );
      }

      teamId = team.id;
    }

    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

    if (!team) {
      return NextResponse.json(
        {
          error: "Team niet gevonden.",
        },
        { status: 404 }
      );
    }

    const match = await prisma.activity.create({
      data: {
        type: "MATCH",
        date,
        startTime,
        endTime,
        opponent,
        home,
        teamId,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("POST /api/match error:", error);

    return NextResponse.json(
      {
        error: "Wedstrijd kon niet worden aangemaakt.",
      },
      { status: 500 }
    );
  }
}