# 📱 iOS Push-уведомления - Итоговая сводка

## 🎯 Проблема

Push-уведомления не работали на iPhone из-за того, что iOS Safari не поддерживает стандартные VAPID ключи. Apple требует использовать Firebase Cloud Messaging (FCM) или Apple Push Notification service (APNs).

## ✅ Решение

Интегрировали Firebase Cloud Messaging:

### Что сделано:

1. **Создан Firebase проект**: `tasktango-uuyq4`
2. **Установлены пакеты**:
   - `firebase` (клиент)
   - `firebase-admin` (сервер)

3. **Клиентская часть** (`src/lib/firebase.ts`):
   - Инициализация Firebase
   - Получение FCM токенов
   - VAPID ключ Firebase: `BI6VJrDsanI4tc6IQ2S71mzeuhBtMNMTchfncwAaoK923WHsE0zEMOWEpxW-298r6qOpIVjbvNBiPZeHYQ4ir9o`

4. **Серверная часть** (`src/lib/firebase-admin.ts`):
   - Firebase Admin SDK с lazy initialization
   - Отправка уведомлений через FCM
   - Обработка ошибок

5. **Гибридная система** (`src/lib/push.ts`):
   - Поддержка старых VAPID подписок (Android/Desktop)
   - Поддержка новых FCM токенов (iOS)
   - Автоматическое определение формата

6. **Обновлённый UI** (`src/components/PushNotificationSetup.tsx`):
   - Использует Firebase для получения токенов
   - Предупреждения для iOS
   - Инструкции по установке PWA

## 🔧 Конфигурация

### Firebase Config (клиент):
```javascript
{
  apiKey: "AIzaSyAhsB6m0mEXGeyU44kwqIyJK1h-zKBe738",
  authDomain: "tasktango-uuyq4.firebaseapp.com",
  projectId: "tasktango-uuyq4",
  storageBucket: "tasktango-uuyq4.firebasestorage.app",
  messagingSenderId: "875453391210",
  appId: "1:875453391210:web:a8dc7df64d21d4c46a8513"
}
```

### Environment Variables (Vercel):
```
FIREBASE_PROJECT_ID=tasktango-uuyq4
FIREBASE_PRIVATE_KEY_ID=ea426e1b8d361ad1321d38e6db824a90fa5c11ea
FIREBASE_PRIVATE_KEY=<полный приватный ключ>
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@tasktango-uuyq4.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=110304382595328323748
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tasktango-uuyq4.iam.gserviceaccount.com
```

## 📊 Как это работает

### Старая система (VAPID):
```
Браузер → Service Worker → Web Push API → Push Service → Устройство
```
❌ Не работает на iOS Safari

### Новая система (FCM):
```
Браузер → Firebase SDK → FCM Token → Сервер → Firebase Admin SDK → FCM → APNs → iPhone
```
✅ Работает на iOS 16.4+

## 🔄 Процесс подписки

1. Пользователь открывает PWA на iPhone
2. Компонент `PushNotificationSetup` запрашивает разрешение
3. Firebase SDK получает FCM токен
4. Токен отправляется на `/api/push/subscribe`
5. Токен сохраняется в БД в поле `pushSubscription`

## 📤 Процесс отправки

1. Создаётся задача через `/api/tasks`
2. Вызывается `sendPushToCouple()`
3. Для каждого пользователя:
   - Проверяется формат подписки (JSON = VAPID, строка = FCM)
   - VAPID: отправка через `web-push`
   - FCM: отправка через `firebase-admin`
4. Уведомление доставляется на устройство

## 🎯 Требования для iOS

- ✅ iOS 16.4 или новее
- ✅ Safari браузер
- ✅ PWA установлено (через "На экран Домой")
- ✅ HTTPS (Vercel)
- ✅ Разрешение на уведомления

## 🧪 Тестирование

### Проверка подписки:
```javascript
// В консоли браузера
console.log('Permission:', Notification.permission);
```

### Проверка отправки:
```javascript
// В логах Vercel
"✅ FCM notification sent: projects/tasktango-uuyq4/messages/..."
"✅ FCM push notification sent to user <userId>"
```

## 📝 Следующие шаги

1. ✅ Код запушен в GitHub
2. ⏳ Vercel деплоит новую версию
3. 🔍 Проверить переменные окружения в Vercel
4. 📱 Протестировать на iPhone
5. 🎉 Profit!

## 🔗 Полезные ссылки

- Firebase Console: https://console.firebase.google.com/project/tasktango-uuyq4
- Vercel Dashboard: https://vercel.com/prostojhenyas-projects/couple-planner
- Production URL: https://couple-planner-ten.vercel.app

## 💡 Важные заметки

- Старые VAPID подписки продолжат работать на Android/Desktop
- iOS пользователи должны переподписаться для получения FCM токенов
- Firebase бесплатный план: до 10M сообщений/месяц
- Lazy initialization предотвращает ошибки при билде
