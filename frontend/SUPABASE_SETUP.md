# Supabase + Prisma Setup Guide 🐘

> **Goal:** Move JanSathi AI from the temporary in-memory database to a real PostgreSQL database on Supabase.

---

## 👤 YOUR STEPS (Do these in order)

### Step 1️⃣ — Create a Supabase Project
1. Go to **[database.new](https://database.new)** → Sign in with GitHub
2. Click **New Project**
3. Fill in:
   - **Name:** `jansathi-ai`
   - **Database Password:** Create a strong password → **SAVE IT!**
   - **Region:** `South Asia (Mumbai)` or closest
4. Wait 1-2 minutes for it to provision

### Step 2️⃣ — Get Connection Strings
1. In your Supabase dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** → select the **URI** tab
3. You need **two** URLs:
   - ✅ **With** "Use connection pooling" checked → This is `DATABASE_URL`
   - ✅ **Without** connection pooling → This is `DIRECT_URL`

### Step 3️⃣ — Add to `.env.local`
Open `frontend/.env.local` and add these two lines (replace the password):

```env
# Supabase PostgreSQL (connection pooling for API routes)
DATABASE_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection (used by Prisma migrations)
DIRECT_URL="postgres://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

### Step 4️⃣ — Push Schema & Seed Data
Run these commands in order:

```powershell
# Push the Prisma schema to Supabase (creates tables)
npm run db:push

# Seed with demo data (150 users, 420 conversations, 800 events)
npm run db:seed
```

### Step 5️⃣ — Verify
```powershell
# Open Prisma Studio to visually browse your data
npm run db:studio
```
This opens a browser at `http://localhost:5555` showing all your tables and data.

---

## 🤖 WHAT I ALREADY DID

| File | What it does |
|---|---|
| `prisma/schema.prisma` | 4 PostgreSQL tables: users, conversations, messages, analytics_events |
| `src/lib/prisma.ts` | Prisma client singleton (prevents connection leaks) |
| `prisma/seed.ts` | Seeds 150 users + 420 conversations + 800 analytics events |
| `src/app/api/dashboard/route.ts` | Updated to use Prisma (falls back to in-memory if DB not connected) |
| `package.json` | Added `db:push`, `db:seed`, `db:studio`, `db:reset` scripts |

---

## 📋 Quick Reference

| Command | What it does |
|---|---|
| `npm run db:push` | Push schema changes to Supabase |
| `npm run db:seed` | Populate with demo data |
| `npm run db:studio` | Visual database browser |
| `npm run db:reset` | Wipe & re-seed everything |
