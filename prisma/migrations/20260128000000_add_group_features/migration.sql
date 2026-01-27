-- Add new fields to couple_spaces table
ALTER TABLE "couple_spaces" ADD COLUMN "name" TEXT;
ALTER TABLE "couple_spaces" ADD COLUMN "maxMembers" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "couple_spaces" ADD COLUMN "subscription" TEXT NOT NULL DEFAULT 'free';

-- Update existing records to have default values
UPDATE "couple_spaces" SET "maxMembers" = 5 WHERE "maxMembers" IS NULL;
UPDATE "couple_spaces" SET "subscription" = 'free' WHERE "subscription" IS NULL;
