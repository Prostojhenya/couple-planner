# ⚡ Быстрый старт: Обновление до групп

## 🎯 Что нужно сделать

### 1. Применить изменения БД

Выберите один из вариантов:

**Вариант A: Prisma Push (рекомендуется для dev)**
```bash
npx prisma db push
```

**Вариант B: Prisma Migrate (для production)**
```bash
npx prisma migrate deploy
```

**Вариант C: Вручную через SQL**
Выполните в вашей БД:
```sql
ALTER TABLE "couple_spaces" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "couple_spaces" ADD COLUMN IF NOT EXISTS "maxMembers" INTEGER DEFAULT 5;
ALTER TABLE "couple_spaces" ADD COLUMN IF NOT EXISTS "subscription" TEXT DEFAULT 'free';

UPDATE "couple_spaces" 
SET "maxMembers" = 5, "subscription" = 'free' 
WHERE "maxMembers" IS NULL OR "subscription" IS NULL;
```

### 2. Перезапустить приложение

```bash
npm run dev
```

### 3. Проверить

Откройте http://localhost:3000 и убедитесь:
- ✅ Видна иконка кластера 👥 вместо 💑
- ✅ В настройках блок "Группа" вместо "Пара"
- ✅ Можно пригласить до 5 участников

## 🎨 Что изменилось визуально

### Header
**Было**: 💑 (эмодзи)
**Стало**: Иконка кластера с бейджем количества участников

### Настройки
**Было**: Блок "Пара" с 2 участниками
**Стало**: Блок "Группа" с до 5 участников + роли

### Онбординг
**Было**: "Создать пару"
**Стало**: "Создать группу" + информация о Free плане

## 📊 Тарифы

| План | Участники | Иконка | Цена |
|------|-----------|--------|------|
| Free | до 5 | 👥 (серая) | $0 |
| Premium | до 15 | 👥✨ (фиолетовая) | $4.99/мес |
| Team | до 50 | 👥🚀 (золотая) | $9.99/мес |
| Lifetime | до 50 | 👥⭐ (радужная) | $149 |

## 🔧 Проблемы?

### Ошибка подключения к БД
```bash
# Проверьте .env файл
cat .env | grep DATABASE_URL

# Проверьте подключение
npx prisma db pull
```

### Миграция не применяется
```bash
# Сбросить и применить заново (ВНИМАНИЕ: удалит данные!)
npx prisma migrate reset
npx prisma migrate deploy
```

### Иконка не отображается
- Очистите кэш браузера (Ctrl+Shift+R)
- Проверьте консоль на ошибки (F12)
- Перезапустите dev-сервер

## 📚 Документация

- `CHANGES_SUMMARY.md` - полный список изменений
- `MONETIZATION.md` - модель монетизации
- `MIGRATION_GUIDE.md` - детальное руководство
- `UPGRADE_TO_GROUPS.md` - инструкция по обновлению

## ✅ Готово!

Теперь ваше приложение поддерживает группы до 5 человек с красивыми иконками кластера!

Следующий шаг: реализация системы подписок (см. `MONETIZATION.md`)
