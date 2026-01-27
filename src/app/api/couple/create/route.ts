import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🔵 Create couple - Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifyToken(token);
    console.log('🔵 Create couple - User ID:', payload?.userId);
    
    if (!payload) {
      return NextResponse.json({ error: 'Неверный токен' }, { status: 401 });
    }

    const existingMembership = await prisma.coupleMembers.findFirst({
      where: { userId: payload.userId },
    });

    console.log('🔵 Create group - Existing membership:', existingMembership ? 'yes' : 'no');

    if (existingMembership) {
      return NextResponse.json(
        { error: 'Вы уже состоите в группе' },
        { status: 400 }
      );
    }

    console.log('🔵 Create group - Creating group space...');
    
    const coupleSpace = await prisma.coupleSpace.create({
      data: {
        maxMembers: 5,
        subscription: 'free',
        members: {
          create: {
            userId: payload.userId,
            role: 'owner',
          },
        },
      },
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
    });

    console.log('✅ Create group - Success! Group ID:', coupleSpace.id);
    return NextResponse.json(coupleSpace);
  } catch (error) {
    console.error('❌ Create couple - Error:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
