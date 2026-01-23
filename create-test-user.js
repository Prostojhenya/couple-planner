const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@test.com';
  const password = 'test1234';
  const passwordHash = await bcrypt.hash(password, 10);

  // Удаляем если существует
  await prisma.user.deleteMany({
    where: { email }
  });

  // Создаём нового
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Тестовый пользователь'
    }
  });

  console.log('✅ Тестовый пользователь создан!');
  console.log('📧 Email:', email);
  console.log('🔑 Пароль:', password);
  console.log('👤 ID:', user.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
