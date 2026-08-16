import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET — haal bestaande attendance op
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const activityId = Number(searchParams.get('activityId'));

  if (!activityId) {
    return NextResponse.json([], { status: 200 });
  }

  const attendance = await prisma.attendance.findMany({
    where: { activityId },
  });

  return NextResponse.json(attendance);
}

// POST — sla attendance op
export async function POST(req: Request) {
  const body = await req.json();

  const attendance = await prisma.attendance.upsert({
    where: {
      activityId_playerId: {
        activityId: body.activityId,
        playerId: body.playerId,
      },
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
