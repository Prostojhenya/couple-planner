import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const shoppingListSchema = z.object({
  name: z.string().min(1),
});

const shoppingItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  category: z.string().optional(),
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

    let membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    // Если пары нет, возвращаем пустой массив
    if (!membership) {
      return NextResponse.json([]);
    }

    const lists = await prisma.shoppingList.findMany({
      where: { coupleId: membership.coupleId },
      include: {
        items: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Error fetching shopping lists:', error);
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
      return NextResponse.json({ error: 'Создайте пару в настройках' }, { status: 400 });
    }

    const body = await req.json();
    const data = shoppingListSchema.parse(body);

    const list = await prisma.shoppingList.create({
      data: {
        ...data,
        coupleId: membership.coupleId,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(list);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    console.error('Error creating shopping list:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
