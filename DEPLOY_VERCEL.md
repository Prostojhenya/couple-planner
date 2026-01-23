# 🚀 Deploy на Vercel - Постоянный HTTPS URL

## Почему Vercel?

✅ **Бесплатно** для личных проектов
✅ **Постоянный HTTPS URL** (не меняется)
✅ **Автоматический deploy** при push в Git
✅ **Отлично работает** с Next.js
✅ **Push-уведомления работают** на iOS

## 🎯 Быстрый старт (5 минут)

### Вариант 1: Через веб-интерфейс (проще)

#### Шаг 1: Создайте Git репозиторий

Если у вас ещё нет Git репозитория:

```bash
# Инициализируйте Git
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit"
```

#### Шаг 2: Загрузите на GitHub

1. Откройте https://github.com/new
2. Создайте новый репозиторий (например: `couple-planner`)
3. Выполните команды:

```bash
git remote add origin https://github.com/ваш-username/couple-planner.git
git branch -M main
git push -u origin main
```

#### Шаг 3: Deploy на Vercel

1. Откройте https://vercel.com/
2. Нажмите "Sign Up" (можно через GitHub)
3. Нажмите "Add New..." → "Project"
4. Выберите ваш репозиторий `couple-planner`
5. Нажмите "Deploy"

**Готово!** Vercel автоматически:
- Установит зависимости
- Соберёт проект
- Задеплоит приложение
- Даст вам постоянный HTTPS URL

#### Шаг 4: Настройте переменные окружения

1. В Vercel откройте ваш проект
2. Settings → Environment Variables
3. Добавьте переменные из `.env`:

```
DATABASE_URL=file:./dev.db
JWT_SECRET=871772b4376e0851edcefb813a98cdf332523cc524aa602190d3a1b2c3d4e5f6
NEXTAUTH_SECRET=871772b4376e0851edcefb813a98cdf332523cc524aa602190d3a1b2c3d4e5f6
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BK59eg1svDbWdiG3MQKE9C4hlR3UyG6AWjoxpnkAFcnMI_PIJcs3J_86duNeDRFo9CVu3zaFHh5pyAlzhI6Mi9c
VAPID_PRIVATE_KEY=1_tT8NEbzzS5-MfRShUfYTS6lIY4hs7ZEl432m_7pAk
VAPID_SUBJECT=mailto:admin@couple-planner.com
```

**ВАЖНО:** `NEXTAUTH_URL` добавится автоматически!

4. Нажмите "Redeploy" для применения изменений

### Вариант 2: Через CLI (быстрее)

```bash
# Установите Vercel CLI
npm install -g vercel

# Войдите в аккаунт
vercel login

# Deploy
vercel

# Следуйте инструкциям:
# - Set up and deploy? Yes
# - Which scope? (выберите ваш аккаунт)
# - Link to existing project? No
# - What's your project's name? couple-planner
# - In which directory is your code located? ./
# - Want to override the settings? No

# Готово! Вы получите URL
```

## 📱 Настройка базы данных для production

### Вариант А: PostgreSQL на Vercel (рекомендуется)

1. В Vercel проекте: Storage → Create Database → Postgres
2. Скопируйте `DATABASE_URL`
3. Обновите в Environment Variables

### Вариант Б: Supabase (бесплатно)

1. Откройте https://supabase.com/
2. Создайте новый проект
3. Database → Connection string → URI
4. Скопируйте и добавьте в Vercel как `DATABASE_URL`

### Вариант В: Railway (бесплатно)

1. Откройте https://railway.app/
2. New Project → Provision PostgreSQL
3. Скопируйте `DATABASE_URL`
4. Добавьте в Vercel

## 🔄 Применение миграций

После настройки базы данных:

```bash
# Локально обновите DATABASE_URL в .env
DATABASE_URL="postgresql://..."

# Примените миграции
npx prisma migrate deploy

# Или создайте новые
npx prisma db push
```

## 📱 Тестирование на iPhone

После deploy:

1. Откройте Safari на iPhone
2. Перейдите на ваш Vercel URL (например: `https://couple-planner.vercel.app`)
3. Войдите в систему
4. Установите как PWA (Поделиться → На экран «Домой»)
5. Разрешите уведомления
6. Проверьте работу!

## 🔧 Автоматический deploy

После настройки каждый push в GitHub автоматически деплоится:

```bash
# Внесите изменения
git add .
git commit -m "Update feature"
git push

# Vercel автоматически задеплоит изменения!
```

## 💡 Полезные команды

```bash
# Deploy в production
vercel --prod

# Посмотреть логи
vercel logs

# Открыть проект в браузере
vercel open

# Посмотреть список deployments
vercel ls

# Удалить deployment
vercel rm [deployment-url]
```

## 🐛 Troubleshooting

### Build ошибка на Vercel:

Проверьте, что в `package.json` есть:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### База данных не работает:

1. Проверьте `DATABASE_URL` в Environment Variables
2. Примените миграции: `npx prisma migrate deploy`
3. Проверьте, что Prisma Client сгенерирован

### Push-уведомления не работают:

1. Проверьте, что все VAPID переменные добавлены
2. Убедитесь, что используете HTTPS URL
3. Переустановите PWA на iPhone

## 📊 Мониторинг

Vercel предоставляет:
- **Analytics** - статистика посещений
- **Logs** - логи приложения
- **Speed Insights** - производительность
- **Web Vitals** - метрики UX

## 💰 Стоимость

**Hobby план (бесплатно):**
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/месяц
- ✅ HTTPS
- ✅ Custom domains
- ✅ Serverless Functions

**Достаточно для личного использования!**

## 🎯 Итог

После deploy на Vercel:
- ✅ Постоянный HTTPS URL
- ✅ Push-уведомления работают на iOS
- ✅ Автоматические обновления
- ✅ Бесплатно
- ✅ Не нужно держать компьютер включённым

## 📚 Дополнительно

- Документация Vercel: https://vercel.com/docs
- Next.js на Vercel: https://vercel.com/docs/frameworks/nextjs
- Prisma на Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
