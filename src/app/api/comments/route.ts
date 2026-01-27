import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const commentSchema = z.object({
  entityType: z.enum(['task', 'event']),
  entityId: z.string(),
  text: z.string().min(1).max(1000),
});

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

    const body = await req.json();
    const data = commentSchema.parse(body);

    // Проверяем, что сущность существует
    if (data.entityType === 'task') {
      const task = await prisma.task.findUnique({
        where: { id: data.entityId },
      });
      if (!task) {
        return NextResponse.json({ error: 'Задача не найдена' }, { status: 404 });
      }
    } else if (data.entityType === 'event') {
      const event = await prisma.event.findUnique({
        where: { id: data.entityId },
      });
      if (!event) {
        return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        authorId: payload.userId,
        text: data.text,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

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

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Требуются entityType и entityId' }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        entityType,
        entityId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
