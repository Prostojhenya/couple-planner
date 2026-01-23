const webpush = require('web-push');

console.log('\n🔑 Генерация VAPID ключей для push-уведомлений...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Добавьте эти ключи в ваш .env файл:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`);
console.log(`VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
console.log(`VAPID_SUBJECT="mailto:your-email@example.com"`);
console.log('\n✅ Готово!\n');
