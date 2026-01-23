# ✅ Исправление для iOS

## 🎯 Что сделано

Ты был прав! Через ngrok работало, значит iOS Safari **поддерживает Web Push API**!

Проблема была в том, что я пытался использовать Firebase SDK, который не работает на iOS Safari.

## 🔄 Что изменилось

### Было (не работало):
- Firebase Cloud Messaging SDK
- `isSupported()` возвращал `false` на iOS
- FCM токены не получались

### Стало (должно работать):
- Обычный Web Push API (как через ngrok)
- Те же VAPID ключи что работали
- Подписки создаются напрямую через `pushManager.subscribe()`

## 📱 Что нужно сделать

После деплоя (2-3 минуты):

### 1. Переподпишись заново

На твоём iPhone (Ольга):

1. **Настройки → Safari → Уведомления**
2. Удали `couple-planner-ten.vercel.app`
3. **Закрой PWA полностью**
4. **Открой PWA заново** через иконку
5. **Нажми кнопку "Включить уведомления"**
6. Разреши когда появится запрос

### 2. Проверь в консоли

Открой консоль Safari и посмотри логи:
```
🔔 Requesting notification permission...
✅ Service Worker and Push Manager supported
✅ Service Worker ready
✅ New subscription created: https://web.push.apple.com/...
```

### 3. Проверь подписку

Открой: https://couple-planner-ten.vercel.app/api/couple/me

Должно показать:
```json
"pushSubscriptionPreview": "https://web.push.apple.com/..."
```

Это нормально! Это та же подписка что работала через ngrok.

### 4. Тест

Создай задачу для партнёра. Уведомление должно прийти!

## 🎉 Почему теперь должно работать

- ✅ Используем тот же Web Push API что работал через ngrok
- ✅ Те же VAPID ключи
- ✅ Та же логика отправки на сервере
- ✅ Просто убрали Firebase SDK который не работал на iOS

## 🔍 Если не работает

Покажи мне:
1. Что показывает в консоли Safari при нажатии "Включить уведомления"
2. Что показывает `/api/couple/me` после подписки
3. Логи Vercel при создании задачи
