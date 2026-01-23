const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearSubscriptions() {
  try {
    console.log('🗑️  Удаляем все старые push-подписки...\n');
    
    const result = await prisma.user.updateMany({
      where: {
        pushSubscription: {
          not: null
        }
      },
      data: {
        pushSubscription: null
      }
    });

    console.log(`✅ Удалено подписок: ${result.count}\n`);
    console.log('💡 Теперь все пользователи должны подписаться заново через PWA\n');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearSubscriptions();
