import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();

  const attendance = await prisma.attendance.upsert({
    where: {
      id: body.id ?? -1,
    },
    update: {
      present: body.present,
    },
    create: {
      activityId: body.activityId,
      playerId: body.playerId,
      present: body.present,
    },
  });

  return NextResponse.json(attendance);
}
