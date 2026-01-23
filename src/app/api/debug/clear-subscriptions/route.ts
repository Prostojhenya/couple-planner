import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function clearSubscriptions() {
  const result = await prisma.user.updateMany({
    where: {
      pushSubscription: {
        not: null
      }
    },
    data: {
      pushSubscription: null
    }
  });

  return {
    success: true,
    clearedCount: result.count,
    message: 'All push subscriptions cleared. Users need to resubscribe.'
  };
}

export async function GET() {
  try {
    const result = await clearSubscriptions();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error clearing subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to clear subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await clearSubscriptions();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error clearing subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to clear subscriptions' },
      { status: 500 }
    );
  }
}
