import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.player.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ ok: true });
}
