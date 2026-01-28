const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  console.log('🔵 Создание тестового пользователя для production...\n');

  const email = process.env.USER_EMAIL || 'test@example.com';
  const password = process.env.USER_PASSWORD || 'password123';
  const name = process.env.USER_NAME || 'Test User';

  // Проверяем, существует ли пользователь
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('⚠️  Пользователь уже существует:');
    console.log('   ID:', existingUser.id);
    console.log('   Email:', existingUser.email);
    console.log('   Имя:', existingUser.name);
    console.log('\n💡 Используйте эти данные для входа или укажите другой email через USER_EMAIL');
    return;
  }

  // Хешируем пароль
  const passwordHash = await bcrypt.hash(password, 10);

  // Создаём пользователя
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  console.log('✅ Пользователь успешно создан!\n');
  console.log('📋 Данные для входа:');
  console.log('   📧 Email:', email);
  console.log('   🔑 Пароль:', password);
  console.log('   👤 Имя:', name);
  console.log('   🆔 ID:', user.id);
  console.log('\n🌐 Войдите на: https://couple-planner-ten.vercel.app/auth/login');
}

main()
  .catch((error) => {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
