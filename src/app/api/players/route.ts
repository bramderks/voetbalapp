import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * GET
 *
 * Haalt spelers op.
 *
 * Zonder teamId:
 *   alle spelers
 *
 * Met teamId:
 *   alleen spelers van dat team
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const teamIdParam = searchParams.get("teamId");

    let teamId: number | undefined;

    if (teamIdParam !== null) {
      teamId = Number(teamIdParam);

      if (!Number.isInteger(teamId) || teamId <= 0) {
        return NextResponse.json(
          {
            error: "Ongeldig teamId.",
          },
          { status: 400 }
        );
      }
    }

    const players = await prisma.player.findMany({
      where:
        teamId !== undefined
          ? {
              teamId,
            }
          : undefined,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("GET /api/players error:", error);

    return NextResponse.json(
      {
        error: "Spelers konden niet worden opgehaald.",
      },
      { status: 500 }
    );
  }
}

/*
 * POST
 *
 * Nieuwe speler toevoegen.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const teamId = Number(body.teamId);

    if (!name) {
      return NextResponse.json(
        {
          error: "Naam is verplicht.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(teamId) || teamId <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig teamId.",
        },
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
        {
          error: "Team niet gevonden.",
        },
        { status: 404 }
      );
    }

    const player = await prisma.player.create({
      data: {
        name,
        teamId,
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("POST /api/players error:", error);

    return NextResponse.json(
      {
        error: "Speler kon niet worden aangemaakt.",
      },
      { status: 500 }
    );
  }
}

/*
 * DELETE
 *
 * Speler verwijderen.
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        {
          error: "Ongeldig speler-ID.",
        },
        { status: 400 }
      );
    }

    const player = await prisma.player.findUnique({
      where: {
        id,
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

    await prisma.player.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("DELETE /api/players error:", error);

    return NextResponse.json(
      {
        error: "Speler kon niet worden verwijderd.",
      },
      { status: 500 }
    );
  }
}