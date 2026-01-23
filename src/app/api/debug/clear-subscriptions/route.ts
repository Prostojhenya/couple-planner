import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
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

    return NextResponse.json({
      success: true,
      clearedCount: result.count,
      message: 'All push subscriptions cleared. Users need to resubscribe.'
    });
  } catch (error) {
    console.error('Error clearing subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to clear subscriptions' },
      { status: 500 }
    );
  }
}
