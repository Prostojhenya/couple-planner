-- Миграция для добавления комментариев
-- Выполнить в Supabase SQL Editor

-- Создаем таблицу comments если её нет
CREATE TABLE IF NOT EXISTS "comments" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- Добавляем foreign key к users
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comments_authorId_fkey'
    ) THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comments_authorId_fkey" 
        FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Добавляем foreign key к tasks (с каскадным удалением)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_task_fk'
    ) THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comment_task_fk" 
        FOREIGN KEY ("entityId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Добавляем foreign key к events (с каскадным удалением)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'comment_event_fk'
    ) THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comment_event_fk" 
        FOREIGN KEY ("entityId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Проверяем что таблица создана
SELECT 'Comments table created successfully!' as status;
SELECT COUNT(*) as comment_count FROM comments;
