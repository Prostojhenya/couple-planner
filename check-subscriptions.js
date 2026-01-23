const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSubscriptions() {
  try {
    const users = await prisma.user.findMany({
      where: {
        pushSubscription: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        pushSubscription: true
      }
    });

    console.log('\n📊 Статус подписок:\n');
    
    for (const user of users) {
      const isVAPID = user.pushSubscription.startsWith('{');
      const isFCM = !isVAPID;
      
      console.log(`👤 ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Тип: ${isVAPID ? '❌ VAPID (старый, не работает на iOS)' : '✅ FCM (новый, работает на iOS)'}`);
      
      if (isVAPID) {
        try {
          const sub = JSON.parse(user.pushSubscription);
          const endpoint = sub.endpoint || 'unknown';
          const isApple = endpoint.includes('apple.com');
          console.log(`   Endpoint: ${isApple ? '🍎 Apple (нужно переподписаться!)' : '🤖 Android/Desktop (работает)'}`);
        } catch (e) {
          console.log(`   Endpoint: ошибка парсинга`);
        }
      } else {
        console.log(`   FCM Token: ${user.pushSubscription.substring(0, 50)}...`);
      }
      console.log('');
    }

    console.log('\n💡 Рекомендации:');
    console.log('   - Пользователи с VAPID подписками на Apple должны переподписаться');
    console.log('   - Для этого нужно:');
    console.log('     1. Открыть PWA на iPhone');
    console.log('     2. Отключить уведомления в настройках Safari');
    console.log('     3. Обновить страницу');
    console.log('     4. Включить уведомления заново\n');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSubscriptions();
