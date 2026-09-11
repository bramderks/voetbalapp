import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function getPlayerId(params: { id: string }) {
  const playerId = Number(params.id);
  return Number.isInteger(playerId) && playerId > 0 ? playerId : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const playerId = getPlayerId(await params);

    if (!playerId) {
      return NextResponse.json({ error: "Ongeldig speler-ID." }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!player) {
      return NextResponse.json({ error: "Speler niet gevonden." }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("GET /api/players/[id] error:", error);
    return NextResponse.json({ error: "Speler kon niet worden opgehaald." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const playerId = getPlayerId(await params);

    if (!playerId) {
      return NextResponse.json({ error: "Ongeldig speler-ID." }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!player) {
      return NextResponse.json({ error: "Speler niet gevonden." }, { status: 404 });
    }

    await prisma.player.delete({ where: { id: playerId } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/players/[id] error:", error);
    return NextResponse.json({ error: "Speler kon niet worden verwijderd." }, { status: 500 });
  }
}
