# 🔥 Firebase Push-уведомления для iOS

## ✅ Что уже сделано

1. **Установлены пакеты**: `firebase` и `firebase-admin`
2. **Создана клиентская конфигурация**: `src/lib/firebase.ts`
3. **Создан Firebase Admin SDK**: `src/lib/firebase-admin.ts` с lazy initialization
4. **Обновлён компонент**: `PushNotificationSetup.tsx` использует FCM
5. **Обновлена библиотека**: `src/lib/push.ts` поддерживает и VAPID и FCM
6. **Код запушен в GitHub** и Vercel автоматически деплоит

## 📋 Что нужно проверить

### 1. Проверить переменные окружения в Vercel

Зайди в Vercel Dashboard → Settings → Environment Variables и убедись что добавлены:

```
FIREBASE_PROJECT_ID = tasktango-uuyq4
FIREBASE_PRIVATE_KEY_ID = ea426e1b8d361ad1321d38e6db824a90fa5c11ea
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...полный ключ...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@tasktango-uuyq4.iam.gserviceaccount.com
FIREBASE_CLIENT_ID = 110304382595328323748
FIREBASE_CLIENT_CERT_URL = https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40tasktango-uuyq4.iam.gserviceaccount.com
```

⚠️ **ВАЖНО**: В `FIREBASE_PRIVATE_KEY` все переносы строк должны быть заменены на `\n`

### 2. Дождаться успешного деплоя

Проверь статус деплоя на Vercel. Должен быть зелёный статус "Ready".

### 3. Протестировать на iPhone

После успешного деплоя:

1. **Открой сайт** в Safari: `https://couple-planner-ten.vercel.app`
2. **Установи PWA**: Поделиться → На экран "Домой"
3. **Открой через иконку** на домашнем экране
4. **Разреши уведомления** когда появится запрос
5. **Создай задачу** для партнёра
6. **Проверь** что уведомление пришло

## 🔍 Как проверить что всё работает

### В консоли браузера (iPhone Safari):

```javascript
// Проверить что Firebase инициализирован
console.log('Firebase apps:', firebase.apps.length);

// Проверить разрешение на уведомления
console.log('Permission:', Notification.permission);
```

### В логах Vercel:

Ищи строки:
- `✅ FCM notification sent:` - уведомление отправлено
- `✅ FCM push notification sent to user` - успешно доставлено

## 🐛 Если не работает

### Ошибка при деплое

Если Vercel показывает ошибку при билде:
- Проверь что все Firebase переменные добавлены
- Проверь что `FIREBASE_PRIVATE_KEY` правильно экранирован (`\n` вместо переносов)

### Уведомления не приходят

1. **Проверь логи Vercel** - есть ли ошибки при отправке
2. **Переподпишись на уведомления**:
   - Открой настройки Safari → Уведомления
   - Удали разрешение для сайта
   - Обнови страницу и разреши заново
3. **Проверь что используется PWA** (открыто через иконку, а не Safari)

## 📱 Требования для iOS

- iOS 16.4 или новее
- Safari браузер
- Приложение установлено как PWA (через "На экран Домой")
- HTTPS соединение (Vercel автоматически)
- Разрешение на уведомления

## 🎯 Следующие шаги

После успешного теста на iPhone:
1. Можно удалить старые VAPID ключи из `.env` (они больше не нужны)
2. Можно удалить ngrok (больше не нужен для тестов)
3. Все пользователи должны переподписаться на уведомления чтобы получить FCM токены
