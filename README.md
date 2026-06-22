# Nexus — Life Management System

A full-stack personal productivity app to manage **tasks**, **notes**, **calendar**, and **finances** in one place. Built with Next.js and Supabase for free deployment.

## Features

- **Dashboard** — Overview of tasks, events, and monthly finances
- **Tasks** — Kanban (drag & drop), list, and calendar views with due dates
- **Notes** — Create, pin, search, and edit notes
- **Calendar** — Calendar and list views for scheduling events
- **Finance** — Income/expense tracking, savings goals, and wallets (IDR)
- **Settings** — Currency (Rupiah) and language (English) preferences
- **Profile** — Avatar upload and personal info (top-right menu)
- **Auth** — Email/password and Google (Gmail) sign-in via Supabase

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) (Auth, Database, Storage)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [@dnd-kit](https://dndkit.com/) for Kanban drag & drop
- TypeScript

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase (automated)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the automated setup script:

```bash
npm run supabase:setup
```

This will:
- Log you into Supabase CLI (if needed)
- Link your remote project
- Push all database tables, RLS policies, and storage
- Configure auth redirect URLs for local dev
- Create `.env.local` with your API keys

You only need your **Project Ref** (from the dashboard URL: `supabase.com/dashboard/project/<project-ref>`).

**Security settings (recommended):**
- Enable Data API — **ON**
- Automatically expose new tables — **OFF**
- Enable automatic RLS — **ON** (optional)

The migration includes explicit API grants, so it works with auto-expose disabled.

**Manual setup (alternative):** Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.

3. Enable **Google** provider under **Authentication → Providers** (optional)
   - Add your Google OAuth Client ID/Secret from [Google Cloud Console](https://console.cloud.google.com/)
   - Set redirect URL: `https://<your-project>.supabase.co/auth/v1/callback`
4. Copy your project URL and anon key from **Project Settings → API** (if not using the script)

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For Google OAuth, also add this redirect URL in Supabase **Authentication → URL Configuration**:

```
http://localhost:3000/auth/callback
```

(Add your production URL when deploying.)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy for Free

### Vercel + Supabase

1. Push this repo to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add the same environment variables in Vercel project settings
4. Add your Vercel URL to Supabase **Authentication → URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

Supabase free tier includes auth, database, and storage — no credit card required.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register
│   ├── (app)/           # Main app (sidebar layout)
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── notes/
│   │   ├── calendar/
│   │   ├── finance/     # Income, savings, wallets
│   │   ├── settings/
│   │   └── profile/
│   └── auth/callback/   # OAuth callback
├── components/
│   ├── layout/          # Sidebar, header, profile menu
│   ├── tasks/           # Kanban, list, calendar views
│   └── ui/              # Shared UI components
├── lib/
│   ├── supabase/        # Client, server, middleware
│   └── currency.ts      # IDR formatting
└── types/
    └── database.ts
```

## Currency & Language

- All monetary values use **Indonesian Rupiah (IDR)**
- UI language is **English**

## License

MIT
