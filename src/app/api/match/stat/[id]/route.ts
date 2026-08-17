import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(req: Request, { params }: RouteParams) {
  const { playerId, field, delta } = await req.json();

  const stat = await prisma.matchStat.upsert({
    where: {
      activityId_playerId: {
        activityId: Number(params.id),
        playerId,
      },
    },
    update: {
      [field]: { increment: delta },
    },
    create: {
      activityId: Number(params.id),
      playerId,
      goals: field === "goals" ? delta : 0,
      assists: field === "assists" ? delta : 0,
    },
  });

  return NextResponse.json(stat);
}
