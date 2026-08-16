import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const player = await prisma.player.create({
    data: {
      name: body.name,
      teamId: body.teamId,
    },
  });
  return NextResponse.json(player);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  await prisma.player.delete({
    where: { id: body.id },
  });
  return NextResponse.json({ ok: true });
}
