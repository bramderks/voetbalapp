import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();

  const stat = await prisma.matchStat.upsert({
    where: {
      id: body.id ?? -1,
    },
    update: {
      goals: body.goals ?? 0,
      assists: body.assists ?? 0,
    },
    create: {
      activityId: body.activityId,
      playerId: body.playerId,
      goals: body.goals ?? 0,
      assists: body.assists ?? 0,
    },
  });

  return NextResponse.json(stat);
}
