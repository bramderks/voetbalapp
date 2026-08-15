import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const team = await prisma.team.findFirst({
    include: { players: true },
  });

  if (!team) {
    return NextResponse.json({ players: [] });
  }

  return NextResponse.json({ players: team.players });
}
