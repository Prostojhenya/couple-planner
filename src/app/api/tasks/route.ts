import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendPushToCouple } from '@/lib/push';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isShared: z.boolean().default(false),
  assigneeType: z.enum(['me', 'partner', 'both']).default('me'),
  status: z.enum(['new', 'in_progress', 'completed', 'postponed']).default('new'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueAt: z.string().optional(),
  requiresApproval: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      console.log('❌ Invalid token');
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    console.log('✅ User ID from token:', payload.userId);

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    if (!membership) {
      console.log('❌ User not in couple:', payload.userId);
      return NextResponse.json({ error: 'Вы не состоите в паре. Создайте пространство пары в настройках.' }, { status: 400 });
    }

    console.log('✅ Couple ID:', membership.coupleId);

    const tasks = await prisma.task.findMany({
      where: {
        coupleId: membership.coupleId,
        OR: [
          { isShared: true },
          { ownerId: payload.userId },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log('✅ Found tasks:', tasks.length);

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('❌ Error in GET /api/tasks:', error);
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
    const data = taskSchema.parse(body);

    const task = await prisma.task.create({
      data: {
        ...data,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        coupleId: membership.coupleId,
        ownerId: payload.userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Отправляем push-уведомление партнёру
    if (data.assigneeType === 'partner' || data.assigneeType === 'both') {
      console.log('🔔 Sending push notification for task:', task.id, 'assigneeType:', data.assigneeType);
      const sentCount = await sendPushToCouple(
        membership.coupleId,
        payload.userId,
        {
          title: '📋 Новая задача',
          body: `${task.owner.name || 'Партнёр'} создал задачу: ${task.title}`,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          tag: `task-${task.id}`,
          data: {
            url: '/tasks',
            taskId: task.id,
          },
        }
      );
      console.log('✅ Push notifications sent:', sentCount);
    } else {
      console.log('⏭️  No push notification sent - assigneeType:', data.assigneeType);
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
