import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { activityId, playerId, present } = await req.json();

  const a = await prisma.attendance.upsert({
    where: {
      activityId_playerId: { activityId, playerId },
    },
    update: { present },
    create: { activityId, playerId, present },
  });

  return NextResponse.json(a);
}
