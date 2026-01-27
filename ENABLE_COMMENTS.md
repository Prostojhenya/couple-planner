# Как включить комментарии обратно

## Проблема решена!
Комментарии временно отключены, чтобы приложение работало без ошибок 500.

## Чтобы включить комментарии:

### Шаг 1: Применить миграцию в Supabase

1. Открой https://supabase.com/dashboard
2. Выбери свой проект
3. Перейди в **SQL Editor** (слева в меню)
4. Создай новый запрос
5. Скопируй весь код из файла `APPLY_COMMENTS_MIGRATION.sql`
6. Вставь в редактор
7. Нажми **Run** (или F5)
8. Должно появиться: "Comments table created successfully!"

### Шаг 2: Включить комментарии в коде

Открой `src/app/dashboard/page.tsx` и найди 2 места с комментариями:

#### Место 1: Task Detail Modal (строка ~1227)
```tsx
{/* Comments Section - Временно отключено до применения миграции БД
<div className="pt-4 border-t border-gray-100">
  <CommentSection
    entityType="task"
    entityId={selectedTask.id}
    currentUserId={user?.id}
  />
</div>
*/}
```

Раскомментируй (убери `{/*` и `*/}`):
```tsx
{/* Comments Section */}
<div className="pt-4 border-t border-gray-100">
  <CommentSection
    entityType="task"
    entityId={selectedTask.id}
    currentUserId={user?.id}
  />
</div>
```

#### Место 2: Event Detail Modal (строка ~1470)
```tsx
{/* Comments Section - Временно отключено до применения миграции БД
<CommentSection
  entityType="event"
  entityId={selectedEvent.id}
  currentUserId={user?.id}
/>
*/}
```

Раскомментируй:
```tsx
{/* Comments Section */}
<CommentSection
  entityType="event"
  entityId={selectedEvent.id}
  currentUserId={user?.id}
/>
```

### Шаг 3: Коммит и пуш

```bash
git add .
git commit -m "feat: включены комментарии после применения миграции"
git push origin main
```

### Шаг 4: Проверка

1. Подожди 1-2 минуты пока Vercel задеплоит
2. Обнови страницу (F5)
3. Открой любую задачу
4. Прокрути вниз
5. Увидишь "💬 Комментарии"
6. Напиши комментарий
7. Нажми "Отправить"
8. Готово! 🎉

## Сейчас приложение работает нормально

Все остальные функции работают:
- ✅ Создание/редактирование/удаление задач
- ✅ Создание/редактирование/удаление событий
- ✅ Подтверждение планов (approve/decline)
- ✅ Toast уведомления
- ✅ Loading states
- ✅ Списки покупок
- ✅ Push-уведомления

Только комментарии временно отключены до применения миграции БД.
