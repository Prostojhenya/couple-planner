-- Comments table already created in previous migration, just add the named foreign keys if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comment_task_fk') THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comment_task_fk" FOREIGN KEY ("entityId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comment_event_fk') THEN
        ALTER TABLE "comments" ADD CONSTRAINT "comment_event_fk" FOREIGN KEY ("entityId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
