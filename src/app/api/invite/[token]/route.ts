import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
      include: {
        couple: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: 'Приглашение не найдено' },
        { status: 404 }
      );
    }

    if (invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Приглашение уже использовано' },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'Приглашение истекло' },
        { status: 400 }
      );
    }

    return NextResponse.json(invite);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const authToken = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!authToken) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifyToken(authToken);
    if (!payload) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    const invite = await prisma.invite.findUnique({
      where: { token: params.token },
      include: { couple: { include: { members: true } } },
    });

    if (!invite || invite.status !== 'pending') {
      return NextResponse.json(
        { error: 'Приглашение недействительно' },
        { status: 400 }
      );
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json(
        { error: 'Приглашение истекло' },
        { status: 400 }
      );
    }

    if (invite.couple.members.length >= 2) {
      return NextResponse.json(
        { error: 'В паре уже 2 участника' },
        { status: 400 }
      );
    }

    const existingMembership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Вы уже состоите в паре' },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.coupleMembers.create({
        data: {
          coupleId: invite.coupleId,
          userId: payload.userId,
          role: 'member',
        },
      }),
      prisma.invite.update({
        where: { id: invite.id },
        data: { status: 'accepted' },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
