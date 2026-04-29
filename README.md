# NorthernGlow Admin Portal

The web-based admin portal for the NorthernGlow / OcFit platform. Gym owners use it to manage their gym, members, classes, and settings. NorthernGlow staff use the built-in Super Admin panel to onboard new gyms.

---

## Architecture

| Layer | Tech |
|---|---|
| Frontend | React + Vite + React Router |
| Backend | Convex (shared with the mobile app) |
| Auth | Convex Auth (email + password) |
| Email | Resend |

The `convex/` directory is a symlink to `../ocfit/convex` — both the mobile app and the admin portal share the same backend. Run `npx convex dev` from the `ocfit/` directory (or this one — they point to the same place).

---

## 1. Setup (first time only)

```bash
# Install dependencies
npm install

# Log in to Convex (if not already)
npx convex login
```

---

## 2. Running Locally

You need **two terminals** — one for Convex, one for Vite.

### Terminal 1 — Convex backend (run from ocfit/ OR ocfit-admin/)
```bash
npx convex dev
```

### Terminal 2 — Vite frontend
```bash
npm run dev
# Opens at http://localhost:5173
```

---

## 3. Environment Variables

Set these in your Convex **dev** deployment:

```bash
npx convex env set NORTHERNGLOW_SUPERADMIN_EMAILS you@example.com
npx convex env set ADMIN_PORTAL_URL http://localhost:5173
npx convex env set AUTH_RESEND_KEY re_xxxxxxxxxxxx
npx convex env set AUTH_EMAIL_FROM "NorthernGlow <hello@yourdomain.com>"
```

For **production**, swap in the live values:

```bash
npx convex env set ADMIN_PORTAL_URL https://admin.yourdomain.com --prod
npx convex env set AUTH_RESEND_KEY re_xxxxxxxxxxxx --prod
# etc.
```

`NORTHERNGLOW_SUPERADMIN_EMAILS` accepts a comma-separated list of emails that have super-admin access.

---

## 4. Roles

| Role | Access |
|---|---|
| `admin` | Full gym management (settings, members, invites, WODs) |
| `coach` | Classes, bookings, member list |
| `athlete` | Mobile app only — no admin portal access |
| Super-admin | NorthernGlow staff — can create gyms and send admin invites |

---

## 5. Onboarding a New Gym (Option B — Invite-only)

New gyms are created by NorthernGlow staff, not by self-sign-up.

1. Log into the admin portal as a super-admin
2. Go to **Super Admin** in the sidebar
3. Fill in the gym details and the gym owner's email → **Create gym & send invite**
4. The gym owner receives an email with a link to the admin portal
5. They sign up using their invited email address
6. They land on an **Accept Invite** page → click accept → go to their dashboard

To resend an invite (e.g. it expired or they missed it), use the **Pending admin invites** table on the Super Admin page and click **Resend**.

---

## 6. Build & Deploy

```bash
# Type check
npx tsc --noEmit

# Production build
npm run build
# Output goes to dist/

# Deploy Convex backend to production
npx convex deploy
```

The `dist/` folder is a standard static site — deploy it to Vercel, Netlify, Cloudflare Pages, or any static host.

---

## Quick Reference

| What | Command |
|---|---|
| Start Convex backend | `npx convex dev` |
| Start admin portal | `npm run dev` |
| Type check | `npx tsc --noEmit` |
| Production build | `npm run build` |
| Deploy backend | `npx convex deploy` |
| List env vars (dev) | `npx convex env list` |
| Set env var (dev) | `npx convex env set KEY value` |
| Set env var (prod) | `npx convex env set KEY value --prod` |
| Open Convex dashboard | `npx convex dashboard` |
