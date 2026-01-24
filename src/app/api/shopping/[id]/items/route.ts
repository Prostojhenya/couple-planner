import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendPushToCouple } from '@/lib/push';
import { z } from 'zod';

const shoppingItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  category: z.string().optional(),
});

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

    const body = await req.json();
    const data = shoppingItemSchema.parse(body);

    // Получаем информацию о списке покупок
    const shoppingList = await prisma.shoppingList.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        coupleId: true,
      },
    });

    if (!shoppingList) {
      return NextResponse.json({ error: 'Список не найден' }, { status: 404 });
    }

    // Получаем информацию о пользователе
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { name: true, email: true },
    });

    const item = await prisma.shoppingItem.create({
      data: {
        ...data,
        shoppingListId: params.id,
        addedById: payload.userId,
      },
    });

    // Отправляем уведомление партнёру
    console.log('🔔 Sending notification for new shopping item:', item.id);
    await sendPushToCouple(
      shoppingList.coupleId,
      payload.userId,
      {
        title: '🛍️ Добавлен товар',
        body: `${user?.name || 'Партнёр'} добавил в "${shoppingList.name}": ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`,
        icon: '/icon-512.png',
        badge: '/icon-512.png',
        tag: `shopping-item-${item.id}`,
        data: {
          url: '/shopping',
          listId: params.id,
          itemId: item.id,
        },
      }
    );

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    console.error('Error creating shopping item:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
