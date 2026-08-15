import { NextResponse } from 'next/server';
import { buildStats } from '@/lib/utils';

export async function GET() {
  const stats = await buildStats();
  return NextResponse.json(stats);
}
