import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET
 *
 * Haalt één activiteit op via:
 * /api/activities?id=1
 *
 * Inclusief:
 * - team
 * - aanwezigheid
 * - spelers
 * - wedstrijdstatistieken
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (!idParam) {
      return NextResponse.json(
        { error: "Activiteit-ID ontbreekt." },
        { status: 400 }
      );
    }

    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Ongeldig activiteit-ID." },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        team: true,
        attendance: {
          include: {
            player: true,
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
        matchStats: {
          include: {
            player: true,
          },
          orderBy: {
            player: {
              name: "asc",
            },
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Activiteit niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("GET /api/activities error:", error);

    return NextResponse.json(
      { error: "Activiteit kon niet worden opgehaald." },
      { status: 500 }
    );
  }
}


/**
 * POST
 *
 * Maakt een nieuwe training of wedstrijd aan.
 *
 * Verplicht:
 * - type
 * - date
 * - startTime
 * - endTime
 * - teamId
 *
 * Wedstrijd:
 * - opponent
 * - home
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const type = String(body.type ?? "").toUpperCase();
    const date = String(body.date ?? "").trim();
    const startTime = String(body.startTime ?? "").trim();
    const endTime = String(body.endTime ?? "").trim();
    const teamId = Number(body.teamId);

    if (type !== "TRAINING" && type !== "MATCH") {
      return NextResponse.json(
        { error: "Type moet TRAINING of MATCH zijn." },
        { status: 400 }
      );
    }

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
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team niet gevonden." },
        { status: 404 }
      );
    }

    let opponent: string | null = null;
    let home: boolean | null = null;

    if (type === "MATCH") {
      opponent =
        typeof body.opponent === "string" && body.opponent.trim().length > 0
          ? body.opponent.trim()
          : null;

      if (body.home !== undefined && body.home !== null) {
        home = Boolean(body.home);
      }
    }

    const created = await prisma.activity.create({
      data: {
        type,
        date,
        startTime,
        endTime,
        opponent,
        home,
        teamId,
        locked: false,
        lockedAt: null,
      },
      include: {
        team: true,
        attendance: true,
        matchStats: true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);

    return NextResponse.json(
      { error: "Activiteit kon niet worden aangemaakt." },
      { status: 500 }
    );
  }
}


/**
 * PATCH
 *
 * Bewerkt een activiteit.
 *
 * BELANGRIJK:
 * Een vergrendelde activiteit kan nooit meer worden aangepast.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Ongeldig activiteit-ID." },
        { status: 400 }
      );
    }

    const existing = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Activiteit niet gevonden." },
        { status: 404 }
      );
    }

    if (existing.locked) {
      return NextResponse.json(
        {
          error:
            "Deze activiteit is gesloten en kan niet meer worden gewijzigd.",
        },
        { status: 409 }
      );
    }

    const data: {
      type?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      opponent?: string | null;
      home?: boolean | null;
    } = {};

    if (body.type !== undefined) {
      const type = String(body.type).toUpperCase();

      if (type !== "TRAINING" && type !== "MATCH") {
        return NextResponse.json(
          { error: "Type moet TRAINING of MATCH zijn." },
          { status: 400 }
        );
      }

      data.type = type;
    }

    if (body.date !== undefined) {
      const date = String(body.date).trim();

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json(
          { error: "Datum moet het formaat YYYY-MM-DD hebben." },
          { status: 400 }
        );
      }

      data.date = date;
    }

    if (body.startTime !== undefined) {
      const startTime = String(body.startTime).trim();

      if (!/^\d{2}:\d{2}$/.test(startTime)) {
        return NextResponse.json(
          { error: "Begintijd moet het formaat HH:mm hebben." },
          { status: 400 }
        );
      }

      data.startTime = startTime;
    }

    if (body.endTime !== undefined) {
      const endTime = String(body.endTime).trim();

      if (!/^\d{2}:\d{2}$/.test(endTime)) {
        return NextResponse.json(
          { error: "Eindtijd moet het formaat HH:mm hebben." },
          { status: 400 }
        );
      }

      data.endTime = endTime;
    }

    if (body.opponent !== undefined) {
      data.opponent =
        typeof body.opponent === "string" && body.opponent.trim().length > 0
          ? body.opponent.trim()
          : null;
    }

    if (body.home !== undefined) {
      data.home =
        body.home === null
          ? null
          : Boolean(body.home);
    }

    const updated = await prisma.activity.update({
      where: { id },
      data,
      include: {
        team: true,
        attendance: {
          include: {
            player: true,
          },
        },
        matchStats: {
          include: {
            player: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/activities error:", error);

    return NextResponse.json(
      { error: "Activiteit kon niet worden gewijzigd." },
      { status: 500 }
    );
  }
}