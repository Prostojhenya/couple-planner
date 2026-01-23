# 🌐 Как получить постоянный URL для push-уведомлений

## Проблема с ngrok:

❌ Бесплатный туннель закрывается через 2 часа
❌ URL меняется при каждом перезапуске
❌ Нужно переустанавливать PWA на iPhone

## ✅ Решение: Deploy на Vercel

**Преимущества:**
- ✅ Бесплатно навсегда
- ✅ Постоянный HTTPS URL
- ✅ Работает 24/7
- ✅ Push-уведомления работают на iOS
- ✅ Автоматические обновления

---

## 🚀 Быстрый deploy (10 минут)

### Шаг 1: Подготовка Git

```bash
# Если Git ещё не инициализирован:
git init
git add .
git commit -m "Initial commit"
```

### Шаг 2: Загрузка на GitHub

**Вариант А: Через GitHub Desktop (проще)**
1. Скачайте GitHub Desktop: https://desktop.github.com/
2. File → Add Local Repository → выберите папку проекта
3. Publish repository → Создайте репозиторий

**Вариант Б: Через командную строку**
1. Создайте репозиторий на https://github.com/new
2. Выполните:
```bash
git remote add origin https://github.com/ваш-username/couple-planner.git
git branch -M main
git push -u origin main
```

### Шаг 3: Deploy на Vercel

1. **Откройте** https://vercel.com/
2. **Зарегистрируйтесь** (можно через GitHub)
3. **Нажмите** "Add New..." → "Project"
4. **Выберите** ваш репозиторий
5. **Нажмите** "Deploy"

**Vercel автоматически всё настроит!**

### Шаг 4: Добавьте переменные окружения

1. В Vercel откройте ваш проект
2. **Settings** → **Environment Variables**
3. Добавьте по одной:

```
DATABASE_URL
Значение: file:./dev.db

JWT_SECRET
Значение: 871772b4376e0851edcefb813a98cdf332523cc524aa602190d3a1b2c3d4e5f6

NEXTAUTH_SECRET
Значение: 871772b4376e0851edcefb813a98cdf332523cc524aa602190d3a1b2c3d4e5f6

NEXT_PUBLIC_VAPID_PUBLIC_KEY
Значение: BK59eg1svDbWdiG3MQKE9C4hlR3UyG6AWjoxpnkAFcnMI_PIJcs3J_86duNeDRFo9CVu3zaFHh5pyAlzhI6Mi9c

VAPID_PRIVATE_KEY
Значение: 1_tT8NEbzzS5-MfRShUfYTS6lIY4hs7ZEl432m_7pAk

VAPID_SUBJECT
Значение: mailto:admin@couple-planner.com
```

4. **Deployments** → три точки → **Redeploy**

### Шаг 5: Получите ваш URL

После deploy вы получите постоянный URL, например:
```
https://couple-planner.vercel.app
```

Или можете подключить свой домен!

---

## 📱 Настройка на iPhone

1. Откройте **Safari**
2. Перейдите на ваш **Vercel URL**
3. Войдите: `test@test.com` / `test1234`
4. **Поделиться** → **На экран «Домой»**
5. Запустите через **иконку**
6. **Разрешите уведомления**

**Теперь всё работает постоянно!** 🎉

---

## 🔄 Обновление приложения

После deploy каждое изменение автоматически публикуется:

```bash
# Внесите изменения в код
git add .
git commit -m "Добавил новую функцию"
git push

# Vercel автоматически задеплоит!
```

---

## 💾 База данных для production

Для production лучше использовать настоящую PostgreSQL базу:

### Вариант 1: Vercel Postgres (рекомендуется)

1. В Vercel проекте: **Storage** → **Create Database** → **Postgres**
2. Скопируйте `DATABASE_URL`
3. Обновите в **Environment Variables**
4. **Redeploy**

**Бесплатно:** 256 MB, 60 часов compute/месяц

### Вариант 2: Supabase (бесплатно)

1. Откройте https://supabase.com/
2. **New project** → заполните данные
3. **Settings** → **Database** → **Connection string** → **URI**
4. Скопируйте и добавьте в Vercel как `DATABASE_URL`
5. **Redeploy**

**Бесплатно:** 500 MB, unlimited API requests

### Вариант 3: Railway (бесплатно)

1. Откройте https://railway.app/
2. **New Project** → **Provision PostgreSQL**
3. Скопируйте `DATABASE_URL`
4. Добавьте в Vercel
5. **Redeploy**

**Бесплатно:** $5 credit/месяц

---

## 🧪 Применение миграций

После настройки базы данных:

```bash
# Обновите DATABASE_URL в .env локально
DATABASE_URL="postgresql://..."

# Примените миграции
npx prisma migrate deploy

# Или создайте схему
npx prisma db push
```

---

## 📊 Что вы получаете

✅ **Постоянный HTTPS URL** - не меняется никогда
✅ **Работает 24/7** - не нужно держать компьютер включённым
✅ **Push-уведомления** - работают на iOS
✅ **Автообновления** - push в Git = автоматический deploy
✅ **Бесплатно** - для личных проектов
✅ **Быстро** - CDN по всему миру
✅ **Мониторинг** - логи, аналитика, метрики

---

## 🎯 Сравнение вариантов

| Функция | ngrok | Vercel |
|---------|-------|--------|
| Стоимость | Бесплатно | Бесплатно |
| URL | Меняется | Постоянный |
| Время работы | 2 часа | 24/7 |
| Нужен компьютер | Да | Нет |
| Push на iOS | Работает | Работает |
| Автообновления | Нет | Да |
| База данных | Локальная | PostgreSQL |

**Вывод: Для постоянного использования - только Vercel!**

---

## 🐛 Частые проблемы

### Build ошибка:
- Проверьте, что все зависимости в `package.json`
- Проверьте, что нет ошибок в коде

### База данных не работает:
- Проверьте `DATABASE_URL` в Environment Variables
- Примените миграции: `npx prisma migrate deploy`

### Push-уведомления не работают:
- Проверьте, что все VAPID переменные добавлены
- Переустановите PWA на iPhone

---

## 💡 Альтернативы Vercel

Если Vercel не подходит:

### Netlify
- Похож на Vercel
- Тоже бесплатный
- https://netlify.com/

### Railway
- Проще с базой данных
- $5 бесплатно/месяц
- https://railway.app/

### Render
- Бесплатный tier
- Автоматический deploy
- https://render.com/

---

## 📚 Дополнительная информация

- `DEPLOY_VERCEL.md` - подробная инструкция
- Документация Vercel: https://vercel.com/docs
- Поддержка: https://vercel.com/support

---

## ✅ Чеклист

- [ ] Git репозиторий создан
- [ ] Код загружен на GitHub
- [ ] Проект задеплоен на Vercel
- [ ] Переменные окружения добавлены
- [ ] Приложение открывается по HTTPS
- [ ] PWA установлено на iPhone
- [ ] Push-уведомления работают

**Готово! Теперь у вас постоянный URL и рабочие уведомления!** 🎉
