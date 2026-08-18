import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  const { playerId, activityId, present } = await request.json();

  const existing = await prisma.attendance.findUnique({
    where: { activityId_playerId: { activityId, playerId } },
  });

  if (existing) {
    const updated = await prisma.attendance.update({
      where: { activityId_playerId: { activityId, playerId } },
      data: { present },
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.attendance.create({
    data: { activityId, playerId, present },
  });

  return NextResponse.json(created);
}
