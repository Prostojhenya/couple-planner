import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
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

    const item = await prisma.shoppingItem.create({
      data: {
        ...data,
        shoppingListId: params.id,
        addedById: payload.userId,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    console.error('Error creating shopping item:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
