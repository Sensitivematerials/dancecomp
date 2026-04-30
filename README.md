# DanceComp Cue Board

Live competition management for emcees and backstage managers.
Built with Next.js, Tailwind CSS, Supabase, and Vercel.

---

## Setup — Step by Step

### 1. Install dependencies

```bash
npm install
```

### 2. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **New Project** — name it `dancecomp`
3. Choose a region close to where you run competitions
4. Wait ~2 minutes for it to spin up

### 3. Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click **Run**

### 4. Get your API credentials

1. In Supabase, go to **Settings → API**
2. Copy **Project URL** and **anon public** key

### 5. Add your credentials

Open `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the app.

### 7. Deploy to Vercel

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and sign up (free)
3. Click **Add New Project** → Import your GitHub repo
4. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

Your app will be live at `https://your-project.vercel.app` within ~2 minutes.
Every `git push` auto-deploys from then on.

---

## Using the App

### Emcee view (`/`)
- See what's on stage right now
- See who's ready to go next
- Put a routine on stage / mark it done
- Remove if wrong number was selected
- Prop warning banner when the next routine needs setup time
- Collapsible view of all checked-in routines

### Backstage view
- Search routines by number, studio, title, or division
- Check in / mark ready / set on stage
- Toggle prop flag on any routine
- Filter by status

### Import
- Upload `.xlsx`, `.xls`, or `.csv`
- Map columns to fields (auto-detected for common headers)
- Preview before confirming
- Download blank template if needed

### Chat
- 💬 button in the header opens the slide-in drawer
- Pick Emcee or Backstage as sender
- Messages sync in real time across all devices
- Pink dot appears on the button when there are unread messages

---

## Project Structure

```
dancecomp/
├── app/
│   ├── layout.tsx          # Root layout + fonts
│   ├── page.tsx            # Main app shell, view routing
│   └── globals.css
├── components/
│   ├── Header.tsx          # Nav + chat toggle
│   ├── EmceeView.tsx       # Emcee/DJ live board
│   ├── BackstageView.tsx   # Backstage manager dashboard
│   ├── ImportView.tsx      # File upload + column mapper
│   ├── ChatDrawer.tsx      # Slide-in chat
│   └── ui/
│       ├── Button.tsx
│       ├── SectionLabel.tsx
│       ├── EmptyState.tsx
│       └── StatusBadge.tsx
├── hooks/
│   ├── useRoutines.ts      # All routine actions + real-time sync
│   └── useChat.ts          # Chat messages + real-time sync
├── lib/
│   └── supabase.ts         # Supabase client
├── types/
│   └── index.ts            # Routine, ChatMessage types
├── supabase/
│   └── schema.sql          # Run this in Supabase SQL Editor
├── .env.local              # Your credentials (never commit this)
└── .env.example            # Safe to commit — shows structure
```

---

## What's Next (future features)

- [ ] Auth — separate logins for emcee and backstage manager
- [ ] Multiple events — create/switch between events
- [ ] Full-screen mode for DJ booth display
- [ ] Timer for current routine on stage
- [ ] Notes for scratches, delays, costume issues
- [ ] Reorder / skip routines
- [ ] Offline backup mode
- [ ] Judge / stage manager read-only display view
