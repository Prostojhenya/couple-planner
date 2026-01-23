# 🚀 Быстрый старт - Планер для двоих

## Шаг 1: Установка зависимостей

```bash
npm install
```

## Шаг 2: Запуск базы данных

### Вариант A: Docker (рекомендуется)
```bash
docker-compose up -d
```

### Вариант B: Локальный PostgreSQL
Установите PostgreSQL и создайте базу:
```sql
CREATE DATABASE couple_planner;
```

## Шаг 3: Настройка окружения

Создайте файл `.env`:
```bash
cp .env.example .env
```

Отредактируйте `.env` и замените значения:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/couple_planner"
JWT_SECRET="замените-на-случайную-строку-минимум-32-символа"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="замените-на-другую-случайную-строку"
```

### Генерация секретных ключей:
```bash
# Для JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Для NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Шаг 4: Применение схемы БД

```bash
npm run db:push
```

Вы должны увидеть:
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

## Шаг 5: Запуск приложения

```bash
npm run dev
```

Откройте браузер: http://localhost:3000

## Шаг 6: Первое использование

### 1. Регистрация
- Нажмите "Регистрация"
- Введите email, пароль (минимум 8 символов)
- Нажмите "Зарегистрироваться"

### 2. Создание пространства пары
- После регистрации вы попадёте на страницу онбординга
- Нажмите "Создать пространство пары"

### 3. Приглашение партнёра
- Введите email партнёра
- Нажмите "Отправить приглашение"
- Скопируйте ссылку-приглашение и отправьте партнёру

### 4. Создание первой задачи
- На дашборде нажмите "+ Задача"
- Заполните форму:
  - Название: "Купить продукты"
  - Описание: "Молоко, хлеб, яйца"
  - Приоритет: Средний
  - Ответственный: Я
  - Поставьте галочку "Общая задача"
- Нажмите "Создать"

### 5. Создание первого события
- Нажмите "+ Событие"
- Заполните форму:
  - Название: "Ужин в ресторане"
  - Начало: выберите дату и время
  - Конец: выберите дату и время
  - Место: "Ресторан на площади"
  - Участники: Оба
- Нажмите "Создать"

## Полезные команды

```bash
# Просмотр данных в БД
npm run db:studio

# Проверка кода
npm run lint

# Сборка для production
npm run build

# Запуск production версии
npm start
```

## Проверка работоспособности

### Проверка БД
```bash
npm run db:studio
```
Откроется Prisma Studio на http://localhost:5555

### Проверка API
Используйте curl или Postman:

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Возможные проблемы

### Ошибка подключения к БД
```
Error: P1001: Can't reach database server
```
**Решение**: Проверьте что PostgreSQL запущен и DATABASE_URL правильный

### Ошибка при db:push
```
Error: Schema engine error
```
**Решение**: Убедитесь что база данных создана и доступна

### Порт 3000 занят
```
Error: Port 3000 is already in use
```
**Решение**: Остановите другое приложение или измените порт:
```bash
PORT=3001 npm run dev
```

### JWT ошибки
```
Error: JWT malformed
```
**Решение**: Проверьте что JWT_SECRET установлен в .env

## Следующие шаги

- Прочитайте [README.md](README.md) для полной документации
- Изучите [FEATURES.md](FEATURES.md) для списка функций
- Посмотрите [TODO.md](TODO.md) для планов развития
- Прочитайте [DEPLOYMENT.md](DEPLOYMENT.md) для развёртывания

## Нужна помощь?

- Откройте issue на GitHub
- Проверьте логи в консоли браузера (F12)
- Проверьте логи сервера в терминале

Удачи! 🎉
