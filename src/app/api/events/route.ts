import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendPushToCouple } from '@/lib/push';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string(),
  endAt: z.string(),
  allDay: z.boolean().default(false),
  participants: z.enum(['me', 'partner', 'both']).default('both'),
  location: z.string().optional(),
  requiresApproval: z.boolean().default(false),
});

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

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Вы не состоите в паре' }, { status: 400 });
    }

    const events = await prisma.event.findMany({
      where: {
        coupleId: membership.coupleId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Вы не состоите в паре' }, { status: 400 });
    }

    const body = await req.json();
    const data = eventSchema.parse(body);

    const event = await prisma.event.create({
      data: {
        ...data,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        coupleId: membership.coupleId,
        createdById: payload.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Отправляем push-уведомление партнёру
    if (data.participants === 'partner' || data.participants === 'both') {
      const startDate = new Date(data.startAt).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
      });
      
      await sendPushToCouple(
        membership.coupleId,
        payload.userId,
        {
          title: '📅 Новое событие',
          body: `${event.createdBy.name || 'Партнёр'} создал событие: ${event.title} (${startDate})`,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          tag: `event-${event.id}`,
          data: {
            url: '/dashboard?screen=events',
            eventId: event.id,
          },
        }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
