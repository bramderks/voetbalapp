import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const { name } = await req.json();

  const player = await prisma.player.create({
    data: { name, teamId: 1 },
  });

  return NextResponse.json(player);
}
