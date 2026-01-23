const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@demo.com';
  const password = 'demo1234';
  const passwordHash = await bcrypt.hash(password, 10);

  // Удаляем если существует
  await prisma.user.deleteMany({
    where: { email }
  });

  // Создаём пользователя с парой
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Демо пользователь'
    }
  });

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
  });

  console.log('✅ Новый пользователь создан!');
  console.log('📧 Email:', email);
  console.log('🔑 Пароль:', password);
  console.log('👤 ID:', user.id);
  console.log('💑 ID пары:', coupleSpace.id);
  console.log('\n🚀 Используйте эти данные для входа!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
