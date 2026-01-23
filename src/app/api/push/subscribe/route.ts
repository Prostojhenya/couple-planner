import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Push subscribe request received');
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ User authenticated:', payload.userId);

    const subscription = await request.json();
    console.log('📝 Subscription data received:', subscription.endpoint?.substring(0, 50) + '...');

    // Сохраняем подписку в базе данных
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        pushSubscription: JSON.stringify(subscription),
      },
    });

    console.log('✅ Push subscription saved for user:', payload.userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}
