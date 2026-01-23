# 📂 Структура проекта

```
couple-planner/
│
├── 📁 prisma/
│   └── schema.prisma              # Схема базы данных Prisma
│
├── 📁 public/                     # Статические файлы
│
├── 📁 src/
│   │
│   ├── 📁 app/                    # Next.js App Router
│   │   │
│   │   ├── 📁 api/                # API эндпоинты
│   │   │   ├── 📁 auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   └── register/route.ts
│   │   │   │
│   │   │   ├── 📁 couple/
│   │   │   │   ├── create/route.ts
│   │   │   │   ├── invite/route.ts
│   │   │   │   └── me/route.ts
│   │   │   │
│   │   │   ├── 📁 tasks/
│   │   │   │   ├── route.ts       # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts   # PATCH, DELETE
│   │   │   │       └── complete/route.ts
│   │   │   │
│   │   │   ├── 📁 events/
│   │   │   │   └── route.ts       # GET, POST
│   │   │   │
│   │   │   ├── 📁 notifications/
│   │   │   │   └── route.ts       # GET
│   │   │   │
│   │   │   └── 📁 invite/
│   │   │       └── [token]/route.ts
│   │   │
│   │   ├── 📁 auth/               # Страницы авторизации
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── 📁 dashboard/          # Главная страница
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 tasks/              # Страница задач
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 onboarding/         # Настройка пары
│   │   │   └── page.tsx
│   │   │
│   │   ├── 📁 invite/             # Принятие приглашения
│   │   │   └── [token]/page.tsx
│   │   │
│   │   ├── layout.tsx             # Корневой layout
│   │   ├── page.tsx               # Главная (лендинг)
│   │   └── globals.css            # Глобальные стили
│   │
│   ├── 📁 components/             # React компоненты
│   │   ├── TaskCard.tsx           # Карточка задачи
│   │   ├── TaskForm.tsx           # Форма создания задачи
│   │   ├── EventCard.tsx          # Карточка события
│   │   └── EventForm.tsx          # Форма создания события
│   │
│   ├── 📁 lib/                    # Утилиты и хелперы
│   │   ├── prisma.ts              # Prisma клиент
│   │   ├── auth.ts                # JWT, bcrypt функции
│   │   └── utils.ts               # Вспомогательные функции
│   │
│   ├── 📁 types/                  # TypeScript типы
│   │   └── index.ts               # Общие типы
│   │
│   └── middleware.ts              # Next.js middleware (защита роутов)
│
├── 📄 .env.example                # Пример переменных окружения
├── 📄 .eslintrc.json              # Конфигурация ESLint
├── 📄 .gitignore                  # Git ignore файлы
├── 📄 docker-compose.yml          # Docker конфигурация
├── 📄 next.config.mjs             # Next.js конфигурация
├── 📄 package.json                # Зависимости и скрипты
├── 📄 postcss.config.mjs          # PostCSS конфигурация
├── 📄 tailwind.config.ts          # Tailwind CSS конфигурация
├── 📄 tsconfig.json               # TypeScript конфигурация
│
├── 📄 README.md                   # Основная документация
├── 📄 QUICKSTART.md               # Быстрый старт
├── 📄 FEATURES.md                 # Список функций
├── 📄 DEPLOYMENT.md               # Инструкция по развёртыванию
├── 📄 TODO.md                     # Планы развития
├── 📄 CONTRIBUTING.md             # Руководство для контрибьюторов
├── 📄 PROJECT_STRUCTURE.md        # Этот файл
└── 📄 LICENSE                     # Лицензия MIT
```

## Описание ключевых файлов

### Конфигурация

- **package.json** - зависимости проекта и npm скрипты
- **tsconfig.json** - настройки TypeScript компилятора
- **tailwind.config.ts** - конфигурация Tailwind CSS
- **next.config.mjs** - настройки Next.js
- **.env.example** - шаблон переменных окружения

### База данных

- **prisma/schema.prisma** - схема БД с моделями:
  - User - пользователи
  - CoupleSpace - пространства пар
  - CoupleMembers - связь пользователей и пар
  - Invite - приглашения
  - Task - задачи
  - Event - события
  - Comment - комментарии
  - Notification - уведомления

### Backend (API)

- **src/app/api/** - все API эндпоинты
- **src/lib/prisma.ts** - singleton Prisma клиент
- **src/lib/auth.ts** - функции авторизации (JWT, bcrypt)
- **src/middleware.ts** - защита приватных роутов

### Frontend

- **src/app/** - страницы приложения (Next.js App Router)
- **src/components/** - переиспользуемые React компоненты
- **src/app/globals.css** - глобальные стили и Tailwind

### Типы

- **src/types/index.ts** - TypeScript интерфейсы и типы

## Потоки данных

### Регистрация пользователя
```
Форма → POST /api/auth/register → Prisma → БД
                ↓
            JWT токен
                ↓
         localStorage
                ↓
         /onboarding
```

### Создание задачи
```
TaskForm → POST /api/tasks → Prisma → БД
              ↓
         Обновление UI
```

### Приглашение партнёра
```
Email → POST /api/couple/invite → Создание Invite
                                       ↓
                                  Генерация токена
                                       ↓
                                  Ссылка /invite/[token]
```

## Соглашения по коду

### Именование файлов
- Компоненты: `PascalCase.tsx` (TaskCard.tsx)
- Утилиты: `camelCase.ts` (auth.ts)
- API роуты: `route.ts`
- Страницы: `page.tsx`

### Структура компонентов
```tsx
'use client'; // если нужен client-side

import { useState } from 'react';

interface ComponentProps {
  // типы пропсов
}

export default function Component({ props }: ComponentProps) {
  // логика
  return (
    // JSX
  );
}
```

### API эндпоинты
```ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // авторизация
    // логика
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}
```

## Зависимости

### Production
- next - фреймворк
- react, react-dom - UI библиотека
- @prisma/client - ORM клиент
- bcryptjs - хэширование паролей
- jsonwebtoken - JWT токены
- zod - валидация данных
- date-fns - работа с датами

### Development
- typescript - типизация
- prisma - ORM CLI
- tailwindcss - CSS фреймворк
- eslint - линтер

## Переменные окружения

```env
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # Секретный ключ для JWT
NEXTAUTH_URL          # URL приложения
NEXTAUTH_SECRET       # Секретный ключ NextAuth
```

## Команды разработки

```bash
npm run dev           # Запуск dev-сервера (localhost:3000)
npm run build         # Сборка для production
npm start             # Запуск production сервера
npm run lint          # Проверка кода ESLint
npm run db:push       # Применить схему БД
npm run db:studio     # Открыть Prisma Studio
```

## Дополнительная информация

- Все страницы используют Next.js App Router
- API роуты автоматически становятся эндпоинтами
- Middleware защищает приватные роуты
- Prisma автоматически генерирует типы
- Tailwind CSS для всех стилей
- TypeScript для типобезопасности
