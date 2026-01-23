const { PrismaClient } = require('@prisma/client');
const webpush = require('web-push');
const fs = require('fs');

// Простой парсер .env файла
function loadEnv() {
  const envFile = fs.readFileSync('.env', 'utf8');
  const lines = envFile.split('\n');
  lines.forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Убираем кавычки
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

loadEnv();

const prisma = new PrismaClient();

async function testPushNotification() {
  try {
    console.log('\n🔔 Тест push-уведомлений\n');

    // Проверяем VAPID ключи
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT;

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('❌ VAPID ключи не настроены в .env файле');
      console.log('Запустите: node generate-vapid-keys.js');
      return;
    }

    console.log('✅ VAPID ключи найдены');
    console.log(`   Public Key: ${vapidPublicKey.substring(0, 20)}...`);
    console.log(`   Subject: ${vapidSubject}\n`);

    // Настраиваем web-push
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    // Ищем пользователей с подписками
    const users = await prisma.user.findMany({
      where: {
        pushSubscription: { not: null }
      },
      select: {
        id: true,
        email: true,
        name: true,
        pushSubscription: true
      }
    });

    if (users.length === 0) {
      console.log('⚠️  Нет пользователей с активными push-подписками');
      console.log('   1. Откройте приложение в браузере');
      console.log('   2. Войдите в систему');
      console.log('   3. Разрешите уведомления');
      return;
    }

    console.log(`📱 Найдено пользователей с подписками: ${users.length}\n`);

    // Отправляем тестовое уведомление каждому
    for (const user of users) {
      console.log(`Отправка уведомления: ${user.name || user.email}`);
      
      try {
        const subscription = JSON.parse(user.pushSubscription);
        
        const payload = JSON.stringify({
          title: '🧪 Тестовое уведомление',
          body: `Привет, ${user.name || 'пользователь'}! Push-уведомления работают!`,
          icon: '/icon-512.png',
          badge: '/icon-512.png',
          data: {
            url: '/dashboard',
            timestamp: new Date().toISOString()
          }
        });

        await webpush.sendNotification(subscription, payload);
        console.log(`   ✅ Отправлено успешно\n`);
      } catch (error) {
        console.error(`   ❌ Ошибка: ${error.message}\n`);
        
        // Если подписка невалидна - удаляем
        if (error.statusCode === 410 || error.statusCode === 404) {
          await prisma.user.update({
            where: { id: user.id },
            data: { pushSubscription: null }
          });
          console.log(`   🗑️  Удалена невалидная подписка\n`);
        }
      }
    }

    console.log('✅ Тест завершён!\n');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPushNotification();
