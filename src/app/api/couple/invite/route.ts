import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import crypto from 'crypto';

const inviteSchema = z.object({
  email: z.string().email(),
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
    const { email } = inviteSchema.parse(body);

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
      include: { couple: { include: { members: true } } },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Сначала создайте группу' },
        { status: 400 }
      );
    }

    const maxMembers = membership.couple.maxMembers || 5;
    if (membership.couple.members.length >= maxMembers) {
      return NextResponse.json(
        { error: `В группе уже максимум участников (${maxMembers})` },
        { status: 400 }
      );
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.invite.create({
      data: {
        coupleId: membership.coupleId,
        token: inviteToken,
        invitedEmail: email,
        status: 'pending',
        expiresAt,
        createdById: payload.userId,
      },
    });

    return NextResponse.json({
      invite,
      inviteUrl: `${process.env.NEXTAUTH_URL}/invite/${inviteToken}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Неверные данные' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
