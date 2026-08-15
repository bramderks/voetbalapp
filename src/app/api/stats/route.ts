import { NextResponse } from 'next/server';
import { buildStats } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const stats = await buildStats();
  return NextResponse.json(stats);
}
