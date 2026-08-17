import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { name, teamId } = await req.json();

  const p = await prisma.player.create({
    data: { name, teamId },
  });

  return NextResponse.json(p);
}
