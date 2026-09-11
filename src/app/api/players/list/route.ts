import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const players = await prisma.player.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(players);
  } catch (error) {
    console.error("GET /api/players/list error:", error);

    return NextResponse.json(
      { error: "Spelers konden niet worden opgehaald." },
      { status: 500 }
    );
  }
}
