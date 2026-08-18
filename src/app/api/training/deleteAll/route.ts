import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE() {
  await prisma.activity.deleteMany({
    where: { type: "training" }
  });

  return NextResponse.json({ ok: true });
}
