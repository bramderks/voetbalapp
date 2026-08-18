import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";


export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: { date: 'asc' },
  });

  return NextResponse.json(activities);
}
