# Eventra — Event Registration System

A modern platform to discover, create, and register for events. Built with
**Next.js 14 (App Router) + TypeScript + Tailwind CSS + MongoDB**, complete with
**Google OAuth**, **RBAC** (Admin / Organizer / Attendee), and **Google Calendar**
integration.

---

## ✨ Features

- 🔐 **Dual authentication** — email/password login (bcrypt) or Google OAuth
- 👥 **3-role RBAC** — Admin, Organizer, Attendee
- 📅 **Event management** — create, edit, delete, draft/published status, capacity & waitlist
- ✅ **Smart registration** — one click, auto-waitlist when full, optional manual approval
- 🛂 **Approval & waitlist management** — organizers approve/reject/promote attendees from a per-event view; freed slots auto-promote the next person off the waitlist
- ✉️ **Transactional emails** — registration confirmation, waitlist, approval decision & waitlist-promotion notices (SMTP; gracefully skipped if unconfigured)
- 🗓️ **Google Calendar** — add **and remove** events from your personal calendar
- 🖼️ **Image upload** — upload event cover images (type/size validated by magic bytes) or paste a URL
- 📄 **Pagination** — page/limit on every list endpoint; "Load more" on the public lists
- 🛡️ **Hardening** — auth rate limiting, same-origin (CSRF) checks, HTML input sanitization, and a strict set of security headers (CSP, HSTS, X-Frame-Options, …)
- 🔎 **SEO** — Open Graph & Twitter metadata, canonical URLs, `robots.txt`, dynamic `sitemap.xml`
- ⏳ **Loading skeletons** — `loading.tsx` skeleton screens while data fetches
- ♿ **Accessibility** — skip link, `main` landmarks, `aria-invalid`/`aria-describedby` on form errors
- 🧪 **Tests** — Vitest unit suite for validation, rate limiting, sanitization, pagination & RBAC helpers
- 📊 **Admin dashboard** — statistics for users, events & registrations
- 🎨 **Modern UI** — dark teal theme, glassmorphism, smooth animations, responsive

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### ⚡ Quick demo (no MongoDB Atlas needed)

Want to see the app running with sample data right away? Just:

```bash
npm install
npm run demo     # in-memory MongoDB + seed + dev server, one command
```

Open http://localhost:3000 and sign in as `admin@eventra.dev` / `password123`.
(The MongoDB binary is downloaded once, then cached.)

---

### 2. Set up environment variables

Copy `.env.example` to `.env.local`, then fill in the values:

```bash
cp .env.example .env.local
```

| Variable | How to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://www.mongodb.com/atlas) → Connect → Drivers |
| `NEXTAUTH_URL` | `http://localhost:3000` for development |
| `NEXTAUTH_SECRET` | PowerShell: `[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))` |
| `GOOGLE_CLIENT_ID` | [Google Cloud Console](https://console.cloud.google.com) → Credentials |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → Credentials |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | *(optional)* SMTP server for transactional emails (e.g. Gmail App Password, Mailtrap, Resend, SES) |

> **The app still runs without Google or SMTP keys.** Email/password login and all
> event features work. Google OAuth & Calendar activate once both Google keys are set;
> emails activate once `SMTP_HOST` is set (otherwise they're logged and skipped).

#### Set up Google OAuth (optional, for Google login + Calendar)

1. Create a project in Google Cloud Console
2. Enable the **Google Calendar API**
3. OAuth Consent Screen → External → add yourself as a **Test User**
4. Credentials → Create OAuth Client ID → **Web Application**
5. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Seed sample data (optional)

```bash
npm run seed
```

Creates 3 test accounts (all with password `password123`):

| Email | Role |
|---|---|
| `admin@eventra.dev` | Admin |
| `organizer@eventra.dev` | Organizer |
| `student@eventra.dev` | Attendee |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run the tests

```bash
npm test          # run the Vitest unit suite once
npm run test:watch
```

Covers Zod validation, the rate limiter, input sanitization, pagination helpers,
the same-origin (CSRF) check, and role-gating helpers.

---

## 🏗️ Architecture

```
src/
├── app/                  # Routing & pages (App Router)
│   ├── (auth)/           # Login & register (split-screen layout)
│   ├── events/           # Browse, detail, create, edit events
│   ├── dashboard/        # Authenticated area: registrations, my events, admin
│   └── api/              # API Route Handlers (replaces Express)
├── components/
│   ├── ui/               # Primitives (shadcn/ui style)
│   ├── layout/           # Navbar, Sidebar, Footer
│   ├── events/           # EventCard, EventForm, RegisterButton, ...
│   ├── auth/             # LoginForm, RegisterForm, Google button
│   ├── dashboard/        # StatsCard, UserTable, list views
│   └── shared/           # RoleBadge, EmptyState, status badges
├── lib/                  # mongodb, auth (NextAuth), Zod validation, helpers
├── models/               # Mongoose schemas: User, Event, Registration
├── hooks/                # TanStack Query hooks
├── types/                # Shared types + NextAuth type extensions
└── middleware.ts         # Layered route protection (RBAC)
```

### Security & RBAC (3 layers)

1. **Edge middleware** — blocks per-role page navigation before render
2. **API route guard** — `requireRole()` on every endpoint before touching the DB
3. **UI conditional** — hides buttons (cosmetic, not a security boundary)

Passwords are stored with bcrypt (`select: false` in the schema, never leaked).
All API input is validated with Zod.

### Hardening

| Concern | Where |
|---|---|
| **Rate limiting** | `lib/rate-limit.ts` — in-memory fixed window on `/api/auth/register` & the credentials login (swap the `Map` for Redis/Upstash in multi-instance deploys) |
| **CSRF** | `lib/http.ts` `assertSameOrigin()` — `Sec-Fetch-Site` / Origin-vs-Host check on every mutating route (NextAuth covers auth) |
| **Input sanitization** | `lib/sanitize.ts` — HTML stripped from event title/description/location and user names before storage |
| **Security headers** | `next.config.mjs` `headers()` — CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **Uploads** | `app/api/upload` — organizer/admin only, 5 MB cap, type verified by **magic bytes** (not the client MIME) |

### Notes for production

- **Image storage** — uploads are written to `public/uploads` (works for `next dev`/`next start`
  on a writable disk). On serverless/multi-instance (Vercel), point the upload route at object
  storage (S3 / Cloudinary) instead.
- **OG image** — link previews ship Open Graph **title + description**. Drop a `public/og.png`
  and reference it from `metadata.openGraph.images` for a rich image preview.
- **Email** — set the `SMTP_*` vars to enable transactional email; otherwise it's a logged no-op.

---

## 🛠️ Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · MongoDB/Mongoose · NextAuth.js ·
TanStack Query · Zod · React Hook Form · Google APIs · Nodemailer · Vitest ·
Lucide Icons · Sonner
