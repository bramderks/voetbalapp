// src/app/api/activities/generate/route.ts
import { NextResponse } from 'next/server';
import { generateActivities } from '@/lib/utils';

export async function GET() {
  const result = await generateActivities();
  return NextResponse.json({
    created: result.length,
    ok: true,
  });
}
