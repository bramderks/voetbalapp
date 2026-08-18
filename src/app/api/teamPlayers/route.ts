import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = Number(searchParams.get("teamId"));

  const players = await prisma.player.findMany({
    where: { teamId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(players);
}
