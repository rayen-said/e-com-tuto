import { NextResponse } from 'next/server';
import { getSnapshot } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = getSnapshot();
  return NextResponse.json(snapshot, { status: 200 });
}
