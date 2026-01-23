# Инструкция по развёртыванию

## Локальная разработка

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных

Установите PostgreSQL локально или используйте Docker:

```bash
docker run --name couple-planner-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=couple_planner -p 5432:5432 -d postgres
```

### 3. Настройка переменных окружения

Создайте файл `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/couple_planner?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

### 4. Применение схемы БД

```bash
npm run db:push
```

### 5. Запуск dev-сервера

```bash
npm run dev
```

Откройте http://localhost:3000

## Развёртывание на Vercel + Supabase

### 1. Создайте проект на Supabase
- Зайдите на https://supabase.com
- Создайте новый проект
- Скопируйте DATABASE_URL из Settings → Database

### 2. Разверните на Vercel
```bash
npm install -g vercel
vercel
```

### 3. Добавьте переменные окружения в Vercel
- DATABASE_URL (из Supabase)
- JWT_SECRET (сгенерируйте случайную строку)
- NEXTAUTH_URL (ваш домен на Vercel)
- NEXTAUTH_SECRET (сгенерируйте случайную строку)

### 4. Примените миграции
```bash
npx prisma db push
```

## Развёртывание на собственном сервере

### 1. Установите Node.js и PostgreSQL

### 2. Клонируйте репозиторий
```bash
git clone <your-repo>
cd couple-planner
npm install
```

### 3. Настройте .env

### 4. Соберите проект
```bash
npm run build
```

### 5. Запустите
```bash
npm start
```

### 6. Настройте Nginx (опционально)
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Генерация секретных ключей

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NEXTAUTH_SECRET
openssl rand -base64 32
```

## Проверка работоспособности

1. Регистрация нового пользователя
2. Создание пространства пары
3. Создание задачи
4. Создание события
5. Приглашение партнёра

## Мониторинг

Используйте Prisma Studio для просмотра данных:
```bash
npm run db:studio
```
