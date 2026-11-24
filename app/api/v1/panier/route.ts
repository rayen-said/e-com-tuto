import { NextResponse } from 'next/server';
import { computeCartTotals, getStore } from '@/lib/server-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const store = getStore();
  const totals = computeCartTotals(store.cart, store.products);
  return NextResponse.json({
    redisKey: 'cart:usr_9482',
    cart: store.cart,
    totals,
  });
}
