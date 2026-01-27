# Fix Vercel 500 Errors - Database Migration Required

## Problem
Your production app is getting 500 errors because the database hasn't been migrated with the new tables:
- `CoupleMembers` (couple_members)
- `Comment` (comments)
- Group features tables

## Solution: Run Migrations on Production Database

### Option 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Link your project**:
```bash
vercel link
```

4. **Pull environment variables** (to get DATABASE_URL):
```bash
vercel env pull .env.production
```

5. **Run migrations against production**:
```bash
npx prisma migrate deploy
```
This uses the DATABASE_URL from your production environment.

### Option 2: Direct Database Connection

1. **Get your production DATABASE_URL**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Copy the `DATABASE_URL` value

2. **Set it temporarily**:
```bash
set DATABASE_URL=your_production_database_url_here
```

3. **Run migrations**:
```bash
npx prisma migrate deploy
```

4. **Verify**:
```bash
npx prisma db push
```

### Option 3: Through Vercel Dashboard

If you're using Vercel Postgres:
1. Go to Storage tab in Vercel Dashboard
2. Connect to your database
3. Run the migration SQL files manually from `prisma/migrations/`

## After Migration

Once migrations are complete:
1. Redeploy your app (or it will auto-deploy)
2. Test the endpoints:
   - `/api/couple/me` should work
   - `/api/comments` should work

## Verify It Worked

Check your browser console - the 500 errors should be gone and replaced with successful responses.
