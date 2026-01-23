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

    const body = await request.json();
    
    // Поддержка как старого формата (VAPID), так и нового (FCM)
    const fcmToken = body.fcmToken || JSON.stringify(body);
    console.log('📝 Subscription data received');

    // Сохраняем подписку в базе данных
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        pushSubscription: fcmToken,
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
