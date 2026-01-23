# 💑 Планер для двоих

Веб-приложение для совместного планирования задач и событий для пар, друзей и партнёров.

## ✨ Возможности

- 🔐 Регистрация и авторизация
- 👥 Создание пространства для двоих
- ✅ Личные и общие задачи
- 📅 Календарь событий
- 🎯 Приоритеты и статусы
- 📱 Адаптивный дизайн
- 🔔 Система уведомлений (в разработке)

## 🚀 Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <your-repo>
cd couple-planner
```

2. **Установите зависимости**
```bash
npm install
```

3. **Настройте базу данных**

Создайте PostgreSQL базу или используйте Docker:
```bash
docker run --name couple-planner-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=couple_planner \
  -p 5432:5432 -d postgres
```

4. **Создайте файл `.env`**
```bash
cp .env.example .env
```

Отредактируйте `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/couple_planner"
JWT_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

5. **Примените схему базы данных**
```bash
npm run db:push
```

6. **Запустите dev-сервер**
```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) 🎉

## 📁 Структура проекта

```
couple-planner/
├── prisma/
│   └── schema.prisma          # Схема базы данных
├── src/
│   ├── app/
│   │   ├── api/              # API эндпоинты
│   │   ├── auth/             # Страницы авторизации
│   │   ├── dashboard/        # Главная страница
│   │   ├── tasks/            # Страница задач
│   │   └── onboarding/       # Настройка пары
│   ├── components/           # React компоненты
│   ├── lib/                  # Утилиты (auth, prisma)
│   └── types/                # TypeScript типы
├── public/                   # Статические файлы
└── package.json
```

## 🔌 API Endpoints

### Авторизация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход

### Управление парой
- `POST /api/couple/create` - создать пространство
- `POST /api/couple/invite` - пригласить партнёра
- `GET /api/couple/me` - информация о паре

### Задачи
- `GET /api/tasks` - список задач
- `POST /api/tasks` - создать задачу
- `PATCH /api/tasks/:id` - обновить задачу
- `DELETE /api/tasks/:id` - удалить задачу
- `POST /api/tasks/:id/complete` - завершить задачу

### События
- `GET /api/events` - список событий
- `POST /api/events` - создать событие

### Уведомления
- `GET /api/notifications` - список уведомлений

## 🛠 Технологии

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + bcrypt
- **Validation**: Zod

## 📚 Документация

- [FEATURES.md](FEATURES.md) - Реализованные функции
- [DEPLOYMENT.md](DEPLOYMENT.md) - Инструкция по развёртыванию
- [TODO.md](TODO.md) - Планы развития

## 🧪 Команды

```bash
npm run dev          # Запуск dev-сервера
npm run build        # Сборка для production
npm start            # Запуск production сервера
npm run lint         # Проверка кода
npm run db:push      # Применить схему БД
npm run db:studio    # Открыть Prisma Studio
```

## 🚢 Развёртывание

### Vercel (рекомендуется)
1. Создайте проект на [Vercel](https://vercel.com)
2. Подключите репозиторий
3. Добавьте переменные окружения
4. Deploy!

### Docker
```bash
docker-compose up -d
```

Подробнее в [DEPLOYMENT.md](DEPLOYMENT.md)

## 🤝 Вклад в проект

Приветствуются pull requests! Для больших изменений сначала откройте issue.

## 📄 Лицензия

MIT

## 👨‍💻 Автор

Создано на основе технического задания для веб-приложения "Планер для двоих"
