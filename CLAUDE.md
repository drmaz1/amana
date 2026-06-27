# CLAUDE.md — Amana Platform Build Guide

> **بالعربي (للقراءة السريعة):** هذا الملف هو "دماغ المشروع" لـ Claude Code. ضعه في جذر المستودع (نفس مكان `package.json`). Claude Code يقرأه تلقائياً في كل جلسة كذاكرة دائمة. كل القرارات التقنية مُتخذة هنا — مهمتك أن تكتب الكود وتنفّذ خارطة الطريق بالترتيب، مع إبقاء التطبيق قابلاً للتشغيل في كل خطوة. رسالة البدء التي تُلصقها في أول محادثة موجودة في آخر هذا الملف تحت **Kickoff Prompt**.

This file is the single source of truth for completing **Amana (أمانة)** — an Arabic‑first, RTL, mobile‑first platform for inter‑governorate **seat booking** and **parcel transport** in Iraq. All architectural decisions below are **final**; implement them rather than re‑deciding. Keep the app runnable after every task.

---

## 0. How you (Claude Code) should work

1. Read this whole file first. Then run the project once to confirm the baseline (`npm install`, set up `.env`, `npm run dev`).
2. Work **phase by phase, task by task, top to bottom**. Do not jump ahead — later phases depend on earlier ones.
3. **One task = one focused commit.** Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). Keep diffs reviewable.
4. After **every** task, run the Quality Gates (§7). A task is not "done" until all gates pass.
5. Keep the app working at all times. Never leave `main` in a broken state. If a change is large, stage it so the app still builds.
6. Maintain a running checklist: as you finish each `[ ]` below, change it to `[x]` in this file and note anything non‑obvious in `docs/DECISIONS.md`.
7. Only stop to ask the human if you hit a **true blocker** (missing secret, ambiguous product call not covered here). Otherwise, decide sensibly and proceed, recording the decision.

---

## 1. Golden rules (do not drift)

These come from the existing codebase. Preserve them in every new file.

- **Design system is fixed.** Primary = deep teal‑green `#0B5D51` (`hsl(171 79% 20%)`). Accent = saffron `#E0A526` (`hsl(41 78% 50%)`). Background = warm stone (`hsl(45 19% 96%)`). Use the CSS variables in `globals.css`; never hardcode new brand colors.
- **Signature element = `RouteLine`** (`src/components/route-line.tsx`): the origin→destination dashed connector with city dots. Reuse it anywhere a trip/parcel route is shown. Don't reinvent route displays.
- **Fonts:** Cairo (display, `var(--font-display)`) + IBM Plex Sans Arabic (body, `var(--font-body)`), wired via `next/font` in `layout.tsx`. Don't add new font loaders.
- **RTL & Arabic are first‑class.** `dir="rtl"`, `lang="ar"`. Use **logical** Tailwind utilities only (`ps/pe`, `ms/me`, `start/end`, `text-start/text-end`) — never `pl/pr/left/right`.
- **Numbers & money:** always format via the helpers in `src/lib/utils.ts` (`formatIQD`, `formatArabicDate`, `formatTime`, `formatDuration`) using `ar-IQ`. Apply the `.nums` class to any element showing digits (tabular numerals).
- **Data‑layer principle (critical):** every page/route reads through `src/lib/data.ts`. Today its functions return in‑memory mocks. Your job in P0 is to swap each body for a real Prisma query **while keeping the exact return shapes** so pages need no edits. Never let a page or component import Prisma directly — go through the data layer (reads) or server actions (writes).
- **Server Components by default.** Add `"use client"` only for interactivity (forms, the seat map, anything with state/handlers). Keep data fetching on the server.
- **No browser storage in components** (`localStorage`/`sessionStorage`). Use server state, cookies (for session), or React state.
- **shadcn/ui + Radix** for primitives. Match the patterns already in `src/components/ui/`. Use only **valid `lucide-react` icon names** (e.g. there is no `SteeringWheel` — use `Car`). Verify any new icon name exists before importing.
- **Mobile‑first.** Layouts must work at 360px wide first; the bottom nav is the primary mobile navigation.

---

## 2. Current state (baseline you're inheriting)

- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL.
- **Built & working on mock data:** 8 pages + a login stub — Home, Search results, Trip details, Seat selection, Booking confirmation, Parcel request, Driver dashboard, Admin dashboard, `/login`. All UI, shared components (`RouteLine`, `SeatMap`, `TripCard`, `SearchForm`, `AppShell`, status badges, `AmanaLogo`), and the theme are complete.
- **Prisma schema exists** (`prisma/schema.prisma`): `User` (roles `PASSENGER`/`DRIVER`/`ADMIN`), `Vehicle`, `Trip`, `Booking`, `Parcel`, with enums and indexes. Prices are `Int` (IQD). A `prisma/seed.ts` mirrors the mock data.
- **What is NOT done yet:** no real DB‑backed reads (mock only), no write operations (forms show client‑side success states but persist nothing), no authentication, no role protection, no validation layer, no tests, no CI, no deployment config. **That is the work below.**

---

## 3. Final technical decisions (do not re‑litigate)

| Concern | Decision |
|---|---|
| **Reads** | Implement real queries inside `src/lib/data.ts` (keep return shapes). Pages stay untouched. |
| **Writes** | **Next.js Server Actions** in `src/lib/actions/` + `revalidatePath`. No separate REST API for the MVP. |
| **Validation** | **Zod** schemas in `src/lib/validation/`, shared by server actions and client forms. Validate on the server in every action; mirror on the client for UX. |
| **DB workflow** | Switch from `prisma db push` to **`prisma migrate dev`** with committed migrations under `prisma/migrations/`. |
| **Double‑booking safety** | Add a **`BookingSeat`** model with a DB‑level `@@unique([tripId, seatNumber])`. This makes double‑booking impossible at the database. Booking creation runs inside `prisma.$transaction`; a unique‑constraint violation → typed "seat taken" error surfaced in the UI. Keep `Booking.seatNumbers` as a denormalized display field; treat `BookingSeat` as the source of truth for availability. |
| **Auth** | Phone **OTP**, custom & dependency‑light (no NextAuth). Add an `OtpCode` table (phone, codeHash, expiresAt, attempts). Two server actions: `requestOtp`, `verifyOtp`. On success, mint a signed **httpOnly cookie** session (JWT via `jose`). Define an `SmsProvider` interface with `ConsoleSmsProvider` (dev: logs the code) and a stub `HttpSmsProvider` (future Iraqi SMS gateway). |
| **Role protection** | `middleware.ts` reads the session cookie and gates `/driver` (role `DRIVER`+) and `/admin` (role `ADMIN`). Unauthverified → `/login?next=…`. |
| **Phone format** | Normalize Iraqi numbers in `src/lib/phone.ts`: local `07XXXXXXXXX` (11 digits) ↔ E.164 `+9647XXXXXXXXX`. Store E.164, display local. |
| **Toasts** | **sonner** for success/error feedback. |
| **Pricing** | Keep the transparent parcel estimate (base fee + per‑kg). Move the rates into config (`src/lib/pricing.ts`) so they're one place to change. A per‑route `PriceRule` table is **optional/P6**. |
| **Testing** | **Vitest** for unit tests (price calc, phone normalization, seat‑availability logic, zod schemas) + **Playwright** for one end‑to‑end happy path (search → select seat → confirm booking). |
| **Installable PWA** | Add `app/manifest.ts` (web manifest) + maskable icons. Mobile‑first → should be installable. |
| **Deployment** | **Vercel** + **Neon** (serverless Postgres). Use a pooled `DATABASE_URL` for the app and `DIRECT_URL` for migrations. Document both. |
| **CI** | **GitHub Actions**: `prisma generate` → lint → `tsc --noEmit` → test → build, on every PR. |

---

## 4. Schema changes to make (P0)

In `prisma/schema.prisma`:

- Add `model BookingSeat { id, tripId, seatNumber Int, booking Booking @relation(...), bookingId, @@unique([tripId, seatNumber]), @@index([tripId]) }`. Wire `Trip` and `Booking` relations to it.
- Add `model OtpCode { id, phone, codeHash, expiresAt DateTime, attempts Int @default(0), consumedAt DateTime?, createdAt, @@index([phone]) }`.
- Keep everything else. Generate the first migration: `npx prisma migrate dev --name init` (this replaces ad‑hoc `db push`).
- Update `prisma/seed.ts` to also create `BookingSeat` rows for the seeded bookings so availability is consistent.

---

## 5. Roadmap (execute in order)

### P0 — Foundation: make it real & runnable
- [x] Add deps: `zod`, `jose`, `sonner`. Dev: `vitest`, `@testing-library/react`, `@playwright/test`. Add npm scripts: `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:e2e` (`playwright test`).
- [x] Apply the schema changes in §4 and create the initial migration. Seed the DB and confirm `npm run db:studio` shows data.
- [x] Implement real Prisma queries in `src/lib/data.ts` for **all** existing functions, preserving return shapes. Derive seat availability from `BookingSeat`. Verify every page renders identically against the DB.
- [x] Add `loading.tsx`, `error.tsx`, and `not-found.tsx` (route‑group level + a global `app/not-found.tsx`) with on‑brand, RTL skeletons/messages.
- [x] Mount `<Toaster />` (sonner) in `layout.tsx`.
- [x] Add `src/lib/phone.ts` (normalize/validate Iraqi numbers) with unit tests.
- [x] Add `src/lib/pricing.ts` (parcel estimate) with unit tests; refactor the parcel form to use it.

### P1 — Real write operations (server actions)
- [x] `src/lib/validation/` — zod schemas: `bookingSchema`, `parcelSchema`, `tripSchema`, `otpRequestSchema`, `otpVerifySchema`.
- [x] `createBooking` action: validate → `prisma.$transaction` that inserts `BookingSeat` rows (unique constraint guarantees no double‑book) + the `Booking` → on success `revalidatePath` the trip/seat pages → return the booking reference. Surface a clear "seat already taken" error to the UI on conflict. Refactor `booking-confirm.tsx` to call it (replace the mock success).
- [x] `createParcel` action: validate → insert `Parcel` → success state with reference. Refactor `parcel-form.tsx`.
- [x] `createTrip` action: validate → insert `Trip` (+ create/select the driver's `Vehicle`) → revalidate `/driver`. Refactor the driver "add trip" form to persist for real.
- [x] Unit‑test the booking transaction (including the concurrent double‑book case → exactly one succeeds).

### P2 — Authentication & roles
- [ ] `SmsProvider` interface + `ConsoleSmsProvider` + `HttpSmsProvider` stub (`src/lib/sms/`).
- [ ] `requestOtp` / `verifyOtp` actions: rate‑limit requests per phone, hash codes, expire after 5 min, cap attempts. On verify, upsert the `User` by phone and mint the JWT cookie session (`jose`), httpOnly + secure + SameSite=Lax.
- [ ] Session utilities (`src/lib/session.ts`): `getSession()`, `requireUser()`, `requireRole(role)`.
- [ ] Build the real `/login` flow (request code → enter code) replacing the stub; honor `?next=`.
- [ ] `middleware.ts`: gate `/driver` and `/admin` by role; redirect unauthenticated users to `/login`.
- [ ] Thread the session user into `createBooking`/`createParcel` (use `passengerId`/`senderId` from the session instead of free‑text identity where logged in; keep guest fields as fallback).

### P3 — Driver & Admin depth
- [ ] Driver: manage vehicles (add/edit), edit & cancel own trips, mark trip `ONGOING`/`COMPLETED`, view passengers + contact for a trip. Each is a validated server action with role check.
- [ ] Admin: list/search/paginate users; promote a user to `DRIVER`/`ADMIN`; moderate/cancel trips; update booking & parcel statuses; assign a `Parcel` to a `Trip`.
- [ ] Add pagination + basic filters to all admin tables (server‑side).

### P4 — Passenger UX completeness
- [ ] Real search filtering: by date, sort by price/time, filter by seats‑available and "accepts parcels"; preserve filters in the URL; on‑brand empty states.
- [ ] "My bookings" and "My parcels" pages for the logged‑in user.
- [ ] Public parcel/booking tracking by reference number.
- [ ] Wire success/error toasts across all forms.

### P5 — Hardening & quality
- [ ] Accessibility & RTL audit (focus states, labels, contrast, keyboard nav on the seat map).
- [ ] Per‑page metadata (`generateMetadata`), `app/sitemap.ts`, `app/robots.ts`, and the PWA manifest + icons.
- [ ] Rate‑limit OTP and booking endpoints; sanitize all inputs; ensure phone normalization everywhere.
- [ ] Playwright e2e for the booking happy path; keep Vitest suite green.
- [ ] Centralized error handling/logging in actions (typed `Result`/error objects, no leaking stack traces to users).

### P6 — Deploy & operate
- [ ] `.env.example` updated: `DATABASE_URL` (pooled), `DIRECT_URL`, `AUTH_SECRET`, SMS provider vars.
- [ ] GitHub Actions CI (generate → lint → typecheck → test → build). `prisma migrate deploy` documented for production.
- [ ] `README.md` refreshed: real setup, auth dev flow (where the OTP prints), migrations, deploy to Vercel + Neon.
- [ ] Optional: `PriceRule` table for per‑route parcel pricing + an admin editor.

---

## 6. Conventions cheat‑sheet

- **Folders:** `src/lib/actions/` (server actions), `src/lib/validation/` (zod), `src/lib/sms/`, `src/lib/session.ts`, `src/lib/phone.ts`, `src/lib/pricing.ts`. Keep `src/lib/data.ts` as the read layer.
- **Server actions** start with `"use server"`, validate with zod, check auth/role, do the work in a transaction when integrity matters, `revalidatePath`, and return a typed result (`{ ok: true, … } | { ok: false, error }`). Never throw raw errors to the client.
- **Naming:** components `PascalCase`, files `kebab-case.tsx`, actions `camelCase`. Arabic UI strings inline (the app is single‑locale Arabic for now); keep them readable.
- **No `<form>` action hacks that break RTL**; use the existing controlled‑input + handler pattern, now calling server actions.
- **Money is always `Int` IQD** end‑to‑end; format only at the view layer.

## 7. Quality Gates (run after every task — all must pass)

```bash
npm run lint
npx tsc --noEmit
npx prisma validate
npm test            # once Vitest is set up
npm run build
```
For schema changes also run `npx prisma migrate dev`. For UI changes, manually verify at 360px width and in RTL. Commit only when green.

---

## 8. Kickoff Prompt (paste this as your first message to Claude Code)

> You are completing the **Amana (أمانة)** platform. **Read `CLAUDE.md` in the repo root in full before doing anything** — it contains all architectural decisions, conventions, and a phased roadmap; treat it as binding.
>
> First, establish the baseline: install dependencies, set up the database from the Prisma schema, seed it, and confirm `npm run dev` runs.
>
> Then execute the roadmap **strictly in order, one task per commit**, starting at **Phase 0**. Keep the app runnable at every step, run the Quality Gates after each task, and check off each item in `CLAUDE.md` as you finish it (recording any non‑obvious choices in `docs/DECISIONS.md`).
>
> The most important early outcome: make every page read real data through `src/lib/data.ts` (swap mock bodies for Prisma, same return shapes), and make booking creation persist safely with the `BookingSeat` unique‑constraint design so double‑booking is impossible.
>
> Don't pause for confirmation between tasks — decide sensibly where the file leaves room, proceed, and only stop if you hit a true blocker (e.g. a missing secret). Begin now with Phase 0, Task 1.
