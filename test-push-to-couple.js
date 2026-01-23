const { PrismaClient } = require('@prisma/client');
const webpush = require('web-push');

const prisma = new PrismaClient();

// VAPID ключи
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@couple-planner.com';

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

async function testPush() {
  try {
    // Найти пару Жени и Ольги
    const zhenya = await prisma.user.findFirst({
      where: { email: 'zhenya@example.com' }
    });

    if (!zhenya) {
      console.log('❌ Женя не найден');
      return;
    }

    const membership = await prisma.coupleMembers.findFirst({
      where: { userId: zhenya.id }
    });

    if (!membership) {
      console.log('❌ Женя не в паре');
      return;
    }

    console.log('✅ Пара найдена:', membership.coupleId);

    // Найти всех участников пары
    const members = await prisma.coupleMembers.findMany({
      where: { coupleId: membership.coupleId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            pushSubscription: true
          }
        }
      }
    });

    console.log('\n👥 Участники пары:');
    members.forEach(m => {
      console.log(`   - ${m.user.name || m.user.email}`);
      console.log(`     Email: ${m.user.email}`);
      console.log(`     Push subscription: ${m.user.pushSubscription ? '✅ Есть' : '❌ Нет'}`);
    });

    // Отправить тестовое уведомление всем у кого есть подписка
    console.log('\n📤 Отправка тестовых уведомлений...');
    
    for (const member of members) {
      if (member.user.pushSubscription) {
        try {
          const subscription = JSON.parse(member.user.pushSubscription);
          
          await webpush.sendNotification(
            subscription,
            JSON.stringify({
              title: '🧪 Тестовое уведомление',
              body: `Привет, ${member.user.name || member.user.email}! Это тест push-уведомлений.`,
              icon: '/icon-512.png',
              badge: '/icon-512.png',
              tag: 'test-notification',
              data: {
                url: '/dashboard'
              }
            })
          );
          
          console.log(`   ✅ Отправлено для ${member.user.email}`);
        } catch (error) {
          console.log(`   ❌ Ошибка для ${member.user.email}:`, error.message);
        }
      } else {
        console.log(`   ⏭️  Пропущено ${member.user.email} - нет подписки`);
      }
    }

    console.log('\n✅ Готово!');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPush();
