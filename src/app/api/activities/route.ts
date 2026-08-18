import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";


export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET — haal activiteit op
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));

  if (!id) {
    return NextResponse.json(null, { status: 200 });
  }

  const activity = await prisma.activity.findUnique({
    where: { id },
  });

  return NextResponse.json(activity ?? null);
}

// PATCH — update activiteit (status)
export async function PATCH(req: Request) {
  const body = await req.json();

  const updated = await prisma.activity.update({
    where: { id: body.id },
    data: {
      status: body.status,
    },
  });

  return NextResponse.json(updated);
}

// POST — nieuwe activiteit (optioneel, maar netjes om compleet te maken)
export async function POST(req: Request) {
  const body = await req.json();

  const created = await prisma.activity.create({
    data: {
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      status: body.status ?? 'open',
    },
  });

  return NextResponse.json(created);
}
