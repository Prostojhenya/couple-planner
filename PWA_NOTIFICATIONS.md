# PWA Push-уведомления

## Настройка

### 1. Генерация VAPID ключей

Запустите команду для генерации ключей:

```bash
node generate-vapid-keys.js
```

Скопируйте сгенерированные ключи в ваш `.env` файл.

### 2. Настройка переменных окружения

Добавьте в `.env`:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="ваш-публичный-ключ"
VAPID_PRIVATE_KEY="ваш-приватный-ключ"
VAPID_SUBJECT="mailto:your-email@example.com"
```

### 3. Регистрация Service Worker

Service Worker автоматически регистрируется при первом посещении приложения. Файл находится в `public/sw.js`.

### 4. Запрос разрешения на уведомления

Компонент `PushNotificationSetup` автоматически отображается на главной странице и запрашивает разрешение у пользователя.

## Как это работает

### Клиентская часть

1. **PushNotificationSetup** (`src/components/PushNotificationSetup.tsx`)
   - Проверяет поддержку браузером
   - Запрашивает разрешение на уведомления
   - Регистрирует Service Worker
   - Подписывается на push-уведомления
   - Отправляет подписку на сервер

2. **Service Worker** (`public/sw.js`)
   - Обрабатывает входящие push-уведомления
   - Показывает уведомления пользователю
   - Обрабатывает клики по уведомлениям

### Серверная часть

1. **API подписки** (`src/app/api/push/subscribe/route.ts`)
   - Сохраняет подписку пользователя в базе данных

2. **Библиотека отправки** (`src/lib/push.ts`)
   - `sendPushNotification(userId, payload)` - отправка уведомления одному пользователю
   - `sendPushToCouple(coupleId, excludeUserId, payload)` - отправка всем членам пары

3. **Интеграция в API**
   - При создании задачи для партнёра автоматически отправляется push-уведомление

## Примеры использования

### Отправка уведомления при создании задачи

```typescript
import { sendPushToCouple } from '@/lib/push';

// После создания задачи
await sendPushToCouple(
  coupleId,
  currentUserId, // исключаем текущего пользователя
  {
    title: '📋 Новая задача',
    body: `${userName} создал задачу: ${taskTitle}`,
    icon: '/icon-512.png',
    badge: '/icon-512.png',
    tag: `task-${taskId}`,
    data: {
      url: '/tasks',
      taskId: taskId,
    },
  }
);
```

### Отправка уведомления конкретному пользователю

```typescript
import { sendPushNotification } from '@/lib/push';

await sendPushNotification(userId, {
  title: '🎉 Поздравляем!',
  body: 'Вы выполнили все задачи на сегодня!',
  icon: '/icon-512.png',
  data: {
    url: '/dashboard',
  },
});
```

## Структура payload

```typescript
interface PushNotificationPayload {
  title: string;           // Заголовок уведомления
  body: string;            // Текст уведомления
  icon?: string;           // Иконка (по умолчанию /icon-512.png)
  badge?: string;          // Значок (по умолчанию /icon-512.png)
  tag?: string;            // Тег для группировки уведомлений
  data?: {                 // Дополнительные данные
    url?: string;          // URL для перехода при клике
    [key: string]: any;
  };
}
```

## Тестирование

### Локальное тестирование

1. Запустите приложение: `npm run dev`
2. Откройте в браузере (Chrome/Edge/Firefox)
3. Разрешите уведомления
4. Создайте задачу для партнёра
5. Проверьте, что уведомление пришло

### Тестирование на мобильном устройстве

1. Установите приложение как PWA
2. Разрешите уведомления
3. Закройте приложение
4. Создайте задачу с другого устройства
5. Проверьте, что уведомление пришло даже при закрытом приложении

## Поддержка браузеров

- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS 16.4+, macOS 13+)
- ❌ Safari (iOS < 16.4)

## Troubleshooting

### Уведомления не приходят

1. Проверьте, что VAPID ключи правильно настроены
2. Проверьте, что Service Worker зарегистрирован (DevTools → Application → Service Workers)
3. Проверьте, что разрешение на уведомления дано (DevTools → Application → Notifications)
4. Проверьте консоль на ошибки

### Service Worker не регистрируется

1. Убедитесь, что приложение работает по HTTPS (или localhost)
2. Проверьте, что файл `public/sw.js` существует
3. Очистите кэш браузера

### Уведомления не показываются на iOS

1. Убедитесь, что iOS версии 16.4 или выше
2. Убедитесь, что приложение установлено как PWA (Add to Home Screen)
3. Проверьте настройки уведомлений в iOS Settings

## Дополнительные возможности

### Добавление действий в уведомления

Можно добавить кнопки действий в уведомления:

```typescript
const options = {
  body: 'У вас новая задача',
  icon: '/icon-512.png',
  actions: [
    { action: 'view', title: 'Посмотреть' },
    { action: 'dismiss', title: 'Закрыть' },
  ],
};
```

### Группировка уведомлений

Используйте `tag` для группировки похожих уведомлений:

```typescript
{
  tag: 'tasks',  // Все уведомления с этим тегом будут группироваться
}
```

### Вибрация

Настройте паттерн вибрации:

```typescript
{
  vibrate: [200, 100, 200],  // вибрация-пауза-вибрация
}
```
