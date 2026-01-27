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

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        couple: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 });
    }

    // Проверяем, что пользователь в паре
    const isMember = event.couple.members.some(m => m.userId === payload.userId);
    if (!isMember) {
      return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });
    }

    // Проверяем, что событие требует подтверждения
    if (!event.requiresApproval) {
      return NextResponse.json({ error: 'Событие не требует подтверждения' }, { status: 400 });
    }

    // Проверяем, что пользователь не автор события
    if (event.createdById === payload.userId) {
      return NextResponse.json({ error: 'Нельзя подтвердить свое событие' }, { status: 400 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: params.id },
      data: {
        approvalStatus: 'approved',
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error approving event:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
