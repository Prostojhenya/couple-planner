import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    // Найти пользователя и его пару
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        pushSubscription: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: user.id },
      include: {
        couple: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    pushSubscription: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    const result = {
      currentUser: {
        email: user.email,
        name: user.name,
        hasPushSubscription: !!user.pushSubscription,
        pushSubscriptionPreview: user.pushSubscription ? 
          JSON.parse(user.pushSubscription).endpoint.substring(0, 50) + '...' : null,
      },
      couple: membership ? {
        id: membership.coupleId,
        members: membership.couple.members.map(m => ({
          email: m.user.email,
          name: m.user.name,
          hasPushSubscription: !!m.user.pushSubscription,
          isCurrentUser: m.userId === user.id,
        }))
      } : null,
      vapidConfigured: !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in debug/push-status:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
