import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function POST(req: Request) {
  const body = await req.json();

  const stats = await prisma.matchStat.upsert({
    where: {
      activityId_playerId: {
        activityId: body.activityId,
        playerId: body.playerId,
      },
    },
    update: {
      goals: body.goals,
      assists: body.assists,
    },
    create: {
      activityId: body.activityId,
      playerId: body.playerId,
      goals: body.goals,
      assists: body.assists,
    },
  });

  return NextResponse.json(stats);
}
