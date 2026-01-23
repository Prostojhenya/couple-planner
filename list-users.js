const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany();
    
    console.log('\n📋 Список пользователей:');
    console.log('='.repeat(50));
    
    if (users.length === 0) {
      console.log('Нет пользователей');
    } else {
      users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`Username: ${u.username || 'не указан'}`);
        console.log(`Email: ${u.email || 'не указан'}`);
        console.log('-'.repeat(50));
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
