# 🚀 Couple Planner - Настройка и использование

## 📋 О проекте

Планер для пар с push-уведомлениями. Создавайте задачи, события и списки покупок вместе!

**URL:** https://couple-planner-ten.vercel.app

---

## 🔧 Локальная разработка

### 1. Установка зависимостей:
```bash
npm install
```

### 2. Настройка базы данных:
```bash
npx prisma generate
npx prisma db push
```

### 3. Запуск:
```bash
npm run dev
```

Приложение откроется на http://localhost:3000

---

## 🔑 Переменные окружения

### Локально (`.env.local`):
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgres://..."
DIRECT_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
NEXTAUTH_SECRET="your-secret-key"

# VAPID Keys (для push-уведомлений)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BK59eg1svDbWdiG3MQKE9C4hlR3UyG6AWjoxpnkAFcnMI_PIJcs3J_86duNeDRFo9CVu3zaFHh5pyAlzhI6Mi9c"
VAPID_PRIVATE_KEY="1_tT8NEbzzS5-MfRShUfYTS6lIY4hs7ZEl432m_7pAk"
VAPID_SUBJECT="mailto:admin@couple-planner.com"
```

### На Vercel:
Добавь те же переменные в: Settings → Environment Variables

---

## 🔔 Push-уведомления

### Что работает:
- ✅ Android (Chrome, Firefox, Edge)
- ✅ Desktop (Windows, macOS, Linux)
- ✅ iOS Safari (с VAPID ключами в Vercel)

### События с уведомлениями:
1. **Создание задачи** - "📋 Новая задача"
2. **Завершение задачи** - "✅ Задача выполнена"
3. **Создание события** - "📅 Новое событие"
4. **Создание списка покупок** - "🛒 Новый список покупок"
5. **Добавление товара** - "🛍️ Добавлен товар"

---

## 🚀 Деплой на Vercel

### Первый раз:
1. Создай репозиторий на GitHub
2. Push код: `git push`
3. Зайди на https://vercel.com
4. Import проект из GitHub
5. Добавь переменные окружения
6. Deploy!

### Обновления:
```bash
git add .
git commit -m "Your message"
git push
```

Vercel автоматически задеплоит изменения.

---

## 🧪 Тестовые пользователи

```
Женя:  zhenya@example.com / password123
Ольга: olga@example.com / password123
```

---

## 📝 Полезные команды

```bash
# Запуск локально
npm run dev

# Сборка проекта
npm run build

# База данных (Prisma Studio)
npx prisma studio

# Очистить push-подписки
node clear-push-subscriptions.js

# Проверить статус подписок
node check-push-status.js

# Отправить тестовое уведомление
node test-push-notification.js
```

---

## 📚 Структура проекта

```
src/
├── app/
│   ├── api/          # API endpoints
│   ├── auth/         # Авторизация
│   ├── dashboard/    # Главная страница
│   ├── tasks/        # Задачи
│   ├── shopping/     # Списки покупок
│   └── layout.tsx    # Layout
├── components/       # React компоненты
├── lib/
│   ├── auth.ts       # JWT авторизация
│   ├── prisma.ts     # Database client
│   ├── push.ts       # Push-уведомления
│   └── utils.ts      # Утилиты
└── types/            # TypeScript типы

public/
├── sw.js             # Service Worker
├── manifest.json     # PWA manifest
└── icons/            # Иконки приложения

prisma/
└── schema.prisma     # Database schema
```

---

## 🎯 Основные функции

### Задачи:
- Создание задач для себя/партнёра/обоих
- Завершение задач
- Фильтрация по статусу
- Push-уведомления

### События:
- Создание событий с датой
- Участники: я/партнёр/оба
- Push-уведомления

### Списки покупок:
- Создание списков
- Добавление товаров с количеством
- Отметка купленных товаров
- Push-уведомления

---

## 🔒 Безопасность

- JWT токены для авторизации
- Bcrypt для хеширования паролей
- HTTPS обязателен для push-уведомлений
- Валидация данных с Zod

---

## 🆘 Проблемы и решения

### Push-уведомления не работают:
1. Проверь, что VAPID ключи добавлены в Vercel
2. Очисти кэш браузера
3. Переподпишись на уведомления
4. Проверь консоль браузера (F12)

### База данных не подключается:
1. Проверь DATABASE_URL в .env.local
2. Запусти `npx prisma generate`
3. Запусти `npx prisma db push`

### Ошибки при деплое:
1. Проверь логи в Vercel Dashboard
2. Убедись, что все переменные окружения добавлены
3. Проверь, что нет TypeScript ошибок

---

## 📞 Контакты

GitHub: https://github.com/Prostojhenya/couple-planner
Vercel: https://couple-planner-ten.vercel.app

---

Сделано с ❤️ для пар
