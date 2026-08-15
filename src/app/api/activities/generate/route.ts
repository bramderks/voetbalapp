import { NextResponse } from 'next/server';
import { generateActivities } from '@/lib/utils';

export async function GET() {
  await generateActivities();
  return NextResponse.json({ success: true });
}
