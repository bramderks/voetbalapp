import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = Number(searchParams.get("teamId"));

    if (!Number.isInteger(teamId) || teamId <= 0) {
      return NextResponse.json(
        { error: "Ongeldig teamId." },
        { status: 400 }
      );
    }

    const players = await prisma.player.findMany({
      where: { teamId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("GET /api/teamPlayers error:", error);

    return NextResponse.json(
      { error: "Spelers konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}
