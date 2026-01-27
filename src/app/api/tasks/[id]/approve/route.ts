import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        couple: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
    }

    // Проверяем, что пользователь в паре
    const isMember = task.couple.members.some(m => m.userId === payload.userId);
    if (!isMember) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    // Проверяем, что задача требует подтверждения
    if (!task.requiresApproval) {
      return NextResponse.json({ error: 'Задача не требует подтверждения' }, { status: 400 });
    }

    // Проверяем, что пользователь не автор задачи
    if (task.ownerId === payload.userId) {
      return NextResponse.json({ error: 'Нельзя подтвердить свою задачу' }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'approved',
      },
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

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error approving task:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
