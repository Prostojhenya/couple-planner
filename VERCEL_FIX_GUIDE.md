# 🔧 Исправление ошибок на Vercel

## Проблема

API возвращает ошибки:
- `POST /api/auth/login` → 401 (Unauthorized) - "Неверный email или пароль"
- `GET /api/tasks` → 400 (Bad Request) - "Вы не состоите в паре"
- `GET /api/events` → 400 (Bad Request) - "Вы не состоите в паре"  
- `POST /api/couple/create` → 500 (Internal Server Error)
- `GET /icon.svg` → 404 (Not Found)

## Причины

1. **База данных не синхронизирована** - новые миграции не применены на production
2. **Пользователь не существует** - нужно зарегистрироваться через `/auth/register`
3. **Пользователи не в группе** - нужно создать группу через onboarding
4. **Отсутствует icon.svg** - нужно добавить или исправить манифест

## ✅ Решение

### Шаг 1: Применить миграции на Vercel

Есть 2 способа:

#### Способ А: Через Vercel CLI (рекомендуется)

```bash
# 1. Установите Vercel CLI (если ещё не установлен)
npm install -g vercel

# 2. Войдите в аккаунт
vercel login

# 3. Подключитесь к production базе данных
# Скопируйте DATABASE_URL из Vercel Dashboard:
# Settings → Environment Variables → DATABASE_URL

# 4. Создайте временный .env.production
echo "DATABASE_URL=your_production_database_url" > .env.production

# 5. Примените миграции
npx prisma migrate deploy --schema=./prisma/schema.prisma

# 6. Удалите временный файл
rm .env.production
```

#### Способ Б: Через Vercel Dashboard

1. Откройте ваш проект на Vercel
2. Settings → Environment Variables
3. Найдите `DATABASE_URL`
4. Скопируйте значение
5. Локально выполните:
   ```bash
   DATABASE_URL="скопированный_url" npx prisma migrate deploy
   ```

### Шаг 2: Проверить переменные окружения

В Vercel Dashboard → Settings → Environment Variables проверьте:

```
DATABASE_URL=postgresql://... (или другая БД)
JWT_SECRET=871772b4376e0851edcefb813a98cdf332523cc524aa602190d3a1b2c3d4e5f6
NEXTAUTH_SECRET=871772b4376e0851edcefb813a98cdf332523cc524aa602190d3a1b2c3d4e5f6
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BK59eg1svDbWdiG3MQKE9C4hlR3UyG6AWjoxpnkAFcnMI_PIJcs3J_86duNeDRFo9CVu3zaFHh5pyAlzhI6Mi9c
VAPID_PRIVATE_KEY=1_tT8NEbzzS5-MfRShUfYTS6lIY4hs7ZEl432m_7pAk
VAPID_SUBJECT=mailto:admin@couple-planner.com
```

### Шаг 3: Исправить icon.svg

Добавьте в `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... существующие настройки
  
  async redirects() {
    return [
      {
        source: '/icon.svg',
        destination: '/icon-512.png',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

Или создайте файл `public/icon.svg` с простой иконкой.

### Шаг 4: Redeploy

После изменений:

```bash
# Закоммитьте изменения
git add .
git commit -m "fix: add icon redirect and update migrations"
git push

# Или через CLI
vercel --prod
```

### Шаг 5: Создать группу для пользователей

После deploy пользователи должны:

1. Открыть приложение
2. Перейти в Onboarding (если не прошли)
3. Нажать "Создать пространство пары"
4. После этого API /tasks и /events будут работать

## 🔍 Проверка

После применения миграций проверьте:

```bash
# Подключитесь к production БД
DATABASE_URL="your_production_url" npx prisma studio

# Проверьте, что есть таблицы:
# - CoupleSpace
# - CoupleMembers
# - Task
# - Event
# - Hub (новая)
# - MindMapCluster (новая)
# - MindMapTask (новая)
# - ClusterMember (новая)
# - InviteLink (новая)
```

## 🐛 Если ошибки остались

### Ошибка 401: "Неверный email или пароль"

Это означает, что пользователь не существует в базе данных.

**📖 Подробное решение:** см. `FIX_401_LOGIN.md`

**Быстрое решение:**
1. Откройте https://couple-planner-ten.vercel.app/auth/register
2. Зарегистрируйте нового пользователя
3. Войдите с этими данными

Или создайте пользователя через скрипт:
```bash
DATABASE_URL="your_production_url" node create-production-user.js
```

### Ошибка: "Вы не состоите в паре"

Это нормально для новых пользователей. Решение:
1. Пользователь должен пройти onboarding
2. Создать группу через `/onboarding` или dashboard
3. После этого API заработает

### Ошибка 500 при создании группы

Проверьте логи Vercel:
```bash
vercel logs
```

Возможные причины:
- Миграции не применены
- DATABASE_URL неверный
- Prisma Client не сгенерирован

Решение:
```bash
# Убедитесь, что в package.json есть:
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```

## 📊 Мониторинг

Следите за логами в реальном времени:

```bash
vercel logs --follow
```

Или в Vercel Dashboard → Deployments → [последний deploy] → Logs

## ✅ Итоговый чеклист

- [ ] Миграции применены на production БД
- [ ] Все переменные окружения настроены
- [ ] icon.svg исправлен (redirect или файл)
- [ ] Redeploy выполнен
- [ ] Пользователи создали группу через onboarding
- [ ] API /tasks и /events работают
- [ ] Push-уведомления работают

## 🎯 Быстрое решение (если нет времени)

Если нужно быстро исправить:

1. Примените миграции:
   ```bash
   DATABASE_URL="production_url" npx prisma migrate deploy
   ```

2. Redeploy:
   ```bash
   vercel --prod
   ```

3. Попросите пользователей:
   - Выйти и войти заново
   - Пройти onboarding
   - Создать группу

Готово! Приложение должно работать.
