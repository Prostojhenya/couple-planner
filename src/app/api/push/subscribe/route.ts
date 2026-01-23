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
    
    // Поддержка как старого формата (fcmToken), так и нового (прямая подписка)
    let subscription: string;
    
    if (body.fcmToken) {
      // Старый формат с FCM токеном
      subscription = body.fcmToken;
    } else if (body.endpoint) {
      // Новый формат - прямая подписка
      subscription = JSON.stringify(body);
    } else {
      // Fallback - весь body как строка
      subscription = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    console.log('📝 Subscription data received, endpoint:', body.endpoint || 'FCM token');

    // Сохраняем подписку в базе данных
    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        pushSubscription: subscription,
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
