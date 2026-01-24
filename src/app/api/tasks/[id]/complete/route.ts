import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendPushToCouple } from '@/lib/push';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    // Получаем задачу с информацией о владельце и паре
    const existingTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    // Обновляем статус задачи
    const task = await prisma.task.update({
      where: { id: params.id },
      data: { status: 'completed' },
    });

    // Получаем информацию о пользователе, который завершил задачу
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        name: true,
        email: true,
      },
    });

    // Получаем пару пользователя
    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
      select: { coupleId: true },
    });

    // Отправляем уведомление партнёру, если задача была для него
    if (membership && existingTask.ownerId !== payload.userId) {
      console.log('🔔 Sending completion notification for task:', task.id);
      await sendPushToCouple(
        membership.coupleId,
        payload.userId,
        {
          title: '✅ Задача выполнена',
          body: `${user?.name || 'Партнёр'} выполнил задачу: ${existingTask.title}`,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          tag: `task-completed-${task.id}`,
          data: {
            url: '/tasks',
            taskId: task.id,
          },
        }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}
