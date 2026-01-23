import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const noteSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  category: z.string().optional(),
  isPinned: z.boolean().optional(),
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

    const notes = await prisma.note.findMany({
      where: { coupleId: membership.coupleId },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
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
    const data = noteSchema.parse(body);

    const note = await prisma.note.create({
      data: {
        ...data,
        coupleId: membership.coupleId,
        createdById: payload.userId,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    console.error('Error creating note:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
