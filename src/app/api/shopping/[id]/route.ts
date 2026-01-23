import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateListSchema = z.object({
  name: z.string().min(1).optional(),
});

export async function PATCH(
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

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Вы не состоите в паре' }, { status: 400 });
    }

    const list = await prisma.shoppingList.findUnique({
      where: { id: params.id },
    });

    if (!list || list.coupleId !== membership.coupleId) {
      return NextResponse.json({ error: 'Список не найден' }, { status: 404 });
    }

    const body = await req.json();
    const data = updateListSchema.parse(body);

    const updatedList = await prisma.shoppingList.update({
      where: { id: params.id },
      data,
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    console.error('Error updating shopping list:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE(
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

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Вы не состоите в паре' }, { status: 400 });
    }

    const list = await prisma.shoppingList.findUnique({
      where: { id: params.id },
    });

    if (!list || list.coupleId !== membership.coupleId) {
      return NextResponse.json({ error: 'Список не найден' }, { status: 404 });
    }

    await prisma.shoppingList.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
