const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@test.com';

  // Находим пользователя
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.log('❌ Пользователь не найден');
    return;
  }

  // Проверяем, есть ли уже пара
  const existingMembership = await prisma.coupleMembers.findFirst({
    where: { userId: user.id }
  });

  if (existingMembership) {
    console.log('✅ Пользователь уже состоит в паре');
    return;
  }

  // Создаём пространство пары
  const coupleSpace = await prisma.coupleSpace.create({
    data: {
      members: {
        create: {
          userId: user.id,
          role: 'member',
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

  console.log('✅ Пространство пары создано!');
  console.log('👤 Пользователь:', user.email);
  console.log('🆔 ID пары:', coupleSpace.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
