import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id) {
    const activity = await prisma.activity.findUnique({
      where: { id: Number(id) },
    });
    return NextResponse.json(activity);
  }

  const activities = await prisma.activity.findMany({
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(activities);
}

export async function POST(req: Request) {
  const body = await req.json();
  const activity = await prisma.activity.create({
    data: {
      date: body.date,
      type: body.type,
      startTime: body.startTime,
      endTime: body.endTime,
      opponent: body.opponent ?? null,
      location: body.location ?? null,
      status: body.status ?? 'registered',
    },
  });

  return NextResponse.json(activity);
}

export async function PATCH(req: Request) {
  const body = await req.json();

  const activity = await prisma.activity.update({
    where: { id: Number(body.id) },
    data: {
      opponent: body.opponent ?? undefined,
      location: body.location ?? undefined,
      startTime: body.startTime ?? undefined,
      endTime: body.endTime ?? undefined,
      status: body.status ?? undefined,
    },
  });

  return NextResponse.json(activity);
}
