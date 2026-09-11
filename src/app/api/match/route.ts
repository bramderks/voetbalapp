import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validTime(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get("teamId");
    let teamId: number | undefined;

    if (teamIdParam) {
      const parsedTeamId = Number(teamIdParam);
      if (!Number.isInteger(parsedTeamId) || parsedTeamId <= 0) {
        return NextResponse.json({ error: "Ongeldig teamId." }, { status: 400 });
      }
      teamId = parsedTeamId;
    }

    const matches = await prisma.activity.findMany({
      where: { type: "MATCH", ...(teamId !== undefined ? { teamId } : {}) },
      orderBy: [{ date: "desc" }, { startTime: "asc" }],
      include: { team: true },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET /api/match error:", error);
    return NextResponse.json({ error: "Wedstrijden konden niet worden opgehaald." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const date = String(body?.date ?? "").trim();
    const startTime = String(body?.startTime ?? "").trim();
    const endTime = String(body?.endTime ?? "").trim();
    const opponent = typeof body?.opponent === "string" && body.opponent.trim() ? body.opponent.trim() : null;
    const home = typeof body?.home === "boolean" ? body.home : null;
    const requestedTeamId = Number(body?.teamId);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !validTime(startTime) || !validTime(endTime)) {
      return NextResponse.json({ error: "Datum, begintijd en eindtijd zijn verplicht en moeten geldig zijn." }, { status: 400 });
    }
    if (endTime <= startTime) {
      return NextResponse.json({ error: "De eindtijd moet na de begintijd liggen." }, { status: 400 });
    }

    let teamId: number;
    if (Number.isInteger(requestedTeamId) && requestedTeamId > 0) {
      teamId = requestedTeamId;
    } else {
      const team = await prisma.team.findFirst({ orderBy: { id: "asc" } });
      if (!team) return NextResponse.json({ error: "Er is nog geen team aangemaakt." }, { status: 400 });
      teamId = team.id;
    }

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return NextResponse.json({ error: "Team niet gevonden." }, { status: 404 });

    const match = await prisma.activity.create({
      data: { type: "MATCH", date, startTime, endTime, opponent, home, teamId },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    console.error("POST /api/match error:", error);
    return NextResponse.json({ error: "Wedstrijd kon niet worden aangemaakt." }, { status: 500 });
  }
}
