import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const wedstrijden = await prisma.activity.findMany({
    where: { type: "MATCH" },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(wedstrijden);
}
