# Decisions log

Non-obvious choices made while completing Amana per `CLAUDE.md`. Newest first.

## Ratings & reviews

- **`Review` model** (migration `20260628135806_add_reviews`): one review per
  booking (`bookingId @unique`), linked to trip/driver/passenger. `createReview`
  lets the passenger who owns a **COMPLETED** booking rate the driver (1–5 +
  optional comment), inside a transaction that recomputes and stores the
  driver's average `rating`. **`tripsCount` is intentionally left untouched** —
  the seed sets large historical counts and recomputing from completed-trip rows
  would degrade the display; rating is the value that becomes live.
- **Prisma engine note**: `prisma generate` fails on the sandbox proxy
  (ECONNRESET on the engine fetch), but the migration applies fine. Regenerate
  the client offline by pointing at the cached engines:
  `PRISMA_QUERY_ENGINE_LIBRARY` + `PRISMA_SCHEMA_ENGINE_BINARY` +
  `PRISMA_ENGINES_MIRROR=file://…/node_modules/@prisma/engines`.
- **UI**: `/me` shows a star + comment `ReviewForm` on completed bookings (or
  the submitted rating once left); trip details list recent reviews. Read-only
  `Stars` component shared by both. Demo seeds a completed trip/booking + sample
  reviews so the flow is browsable with no DB.

## Driver depth — vehicles, trip editing, passenger contact

- **Passenger contact**: `getDriverBookings` now selects the passenger phone
  (driver-only — `getAllBookings`/`getBookingsForTrip` still don't), surfaced as
  a `tel:` call button per booking (E.164 dial, local display). Booking view
  type gained an optional `passengerPhone`.
- **Edit trip**: `updateTrip` (owner/admin, only while `SCHEDULED`) re-resolves
  the vehicle by type+model exactly like `createTrip` so a shared vehicle is
  never mutated, and refuses to shrink the cabin below an already-booked seat.
  The old `AddTripForm` became `TripForm` with an `isEdit` mode (prefills route,
  time, vehicle, per-seat prices); a "تعديل" button opens it inline.
- **Vehicles**: `createVehicle`/`updateVehicle` (driver-owned, demo optimistic,
  P2002 → "اللوحة مستخدمة") + `getDriverVehicles`. A "مركباتي" tab
  (`VehicleManager`) lists/adds/edits vehicles; seat count derives from the type
  via `seatsForVehicle`. Demo seeds two vehicles for the demo driver.

## Admin depth — users, roles, parcel→trip assignment

- **Users management page** (`/admin/users`): server-side paginated + filtered
  (`getUsers({q, role, page, pageSize})` in `data.ts`; demo paginates the mock
  `USERS` array, DB uses `skip`/`take` + a `Prisma.UserWhereInput` with a
  case-insensitive name search + phone `contains`). A reusable
  `AdminPagination` (link-based, preserves query params) and `AdminUserFilters`
  (search + role) drive it. `promoteUser(userId, role)` (admin-guarded, demo
  optimistic) changes a user's role from a small `AdminRoleControl` select that
  mirrors `AdminStatusControl`.
- **Assign parcel → trip**: `assignParcelToTrip(parcelId, tripId|null)` validates
  (DB mode) that the chosen trip accepts parcels and runs the parcel's exact
  route before linking. The admin parcels table gained a "الرحلة" column with an
  `AssignParcelControl` select whose candidates are filtered from the already-
  loaded trips by route (no extra per-parcel query). Added an optional
  `tripId` to the `Parcel` view type so the current assignment shows.

- **Header user menu.** The site header now shows who's signed in (avatar +
  name) with a `<details>`-based dropdown (`src/components/user-menu.tsx`, no
  new Radix dep) linking to رحلاتي `/me`, الملف الشخصي `/account`, الإعدادات
  `/settings`, and a real **logout** (`<form action={logout}>`, hidden in demo).
  When signed out it shows a دخول button. The session read is isolated in an
  async `HeaderUserMenu` server component rendered inside `<Suspense>`.

- **`FallbackShell` for not-found/error/loading.** These three shells must not
  pull `next/headers` (via the session helpers) into their bundle — `error.tsx`
  is a Client Component, so importing the auth-aware `SiteHeader` chain made the
  whole build fail ("next/headers only works in a Server Component"), and any
  `cookies()` reach would also risk making `/_not-found` dynamic. So they use a
  dedicated logo-only `FallbackShell` (`src/components/fallback-shell.tsx`) that
  imports neither `SiteHeader` nor the session layer. Verified: `/_not-found`
  stays `○` (static) in the build output.

- **Dark mode without a server cookie read in the root layout.** Reading the
  `theme` cookie in `app/layout.tsx` would call `cookies()` on every route and
  force them all (incl. `/_not-found`) to render dynamically. Instead a tiny
  blocking inline script in `<body>` reads the `theme` cookie and applies the
  `dark` class before first paint (no FOUC), `<html suppressHydrationWarning>`.
  The `ThemeToggle` flips the same non-httpOnly `theme` cookie + toggles the DOM
  class instantly. No `localStorage` (golden rule); cookies only. The already-
  dynamic `/settings` page reads the cookie server-side to seed the toggle.

- **Profile edit = name only.** Phone is the login identity (shown read-only as
  local `07…`). `updateProfile` re-mints the session cookie via
  `setSessionCookie` after the DB write so the header name updates without a
  re-login. Demo mode returns optimistic success and skips the DB/cookie write.

## Vehicles & per-seat pricing

- **Three vehicle types with realistic cabin layouts** (`src/lib/seats.ts`):
  صالون/SEDAN (4: 1 front + 3 back), SUV (6: 1 + 2 + 3), GMC (7: 1 + 3 + 3).
  Seat 1 is the premium **front** seat; back-row edges are **window**, the
  squeezed centre seat is **middle**. The seat picker renders the actual cabin
  (driver + steering wheel, aisle, rows) so passengers see where they'll sit.
- **Per-seat pricing.** `Trip.seatPrices Int[]` holds a price for every seat;
  the driver sets them in the add-trip form (auto-filled from a base price:
  front +25%, window ×1, middle −20%, all editable). `pricePerSeat` is kept as
  the **minimum** ("starts from"). Booking totals sum the chosen seats'
  prices and are recomputed server-side in `createBooking` (never trusts the
  client). The `VehicleType` enum changed SEDAN/VAN/BUS → SEDAN/SUV/GMC via a
  migration that maps existing VAN/BUS rows to GMC.

## Demo mode (no database)

- **When `DATABASE_URL` is unset, the whole app runs on in-memory mock data**
  (`src/lib/demo-data.ts`) with auth disabled, so it can be browsed end-to-end
  with zero setup (`npm install && npm run dev`). `isDemoMode()` gates this in
  one place each: the data layer returns mocks, write actions return optimistic
  success (fake `AMN-`/`PKG-` refs), `getSession()` returns a synthetic admin,
  the middleware skips gating, the header hides the login button (shows a
  "وضع العرض" chip), and `/login` redirects home. Setting `DATABASE_URL`
  switches everything back to the real DB-backed behavior automatically — no
  code change. The `build` works without a DB (pages are dynamic via `noStore`).

## P5 — Hardening

- **No `revalidatePath` in the write actions.** Every read goes through the
  data layer's `noStore()` queries, so trip/seat/driver/admin pages already
  render fresh on each request — `revalidatePath` was redundant. Worse, calling
  it inside an action invoked from a client form triggered a router refresh that
  **remounted the form and dropped the success state**, so the booking/parcel
  confirmation screens (and their `AMN-`/`PKG-` references) never appeared even
  though the writes persisted. Removing the calls fixed it; the Playwright e2e
  (search → seat → confirm) now passes. The driver dashboard still updates via
  its own `router.refresh()`.

## P2 — Auth

- **Phones are stored in E.164 everywhere.** Per the brief ("store E.164,
  display local"), the seed, OTP auth, booking, and parcel all persist
  `+9647XXXXXXXXX`. The seed originally stored local `07…`, which meant logging
  in as a seeded driver/admin never matched them (auth normalizes to E.164
  before the upsert) and silently created a new PASSENGER. Fixed by storing
  E.164 in the seed and setting the demo-driver constants to E.164. Stored
  numbers are only used in `tel:` links today, where E.164 is preferred; user
  input is still typed/shown locally and normalized on the way in.

- **Session = signed JWT in an httpOnly cookie (`jose`).** Payload carries
  `{ sub: userId, role, name }`. The pure sign/verify lives in
  `src/lib/session-token.ts` (no `next/headers`) so the edge `middleware.ts`
  can verify it; `src/lib/session.ts` adds the Node cookie helpers
  (`getSession`/`requireUser`/`requireRole`). Role changes (e.g. admin
  promotion) take effect on next login since the role is embedded in the token.
  `secure` is on only in production — over local HTTP the cookie is non-secure
  so dev works.

- **OTP dev flow.** Codes are 6 digits, hashed (`sha256(code:phone:secret)`),
  expire after 5 min, cap at 5 attempts, and are rate-limited per phone
  (30s cooldown, 5 per 15 min). The `ConsoleSmsProvider` prints the code to the
  server log; in non-production `requestOtp` also returns it so the login form
  shows it. Log in as a seeded driver (`07701234567`) or admin (`07900000000`)
  to reach those dashboards.

- **Guest vs. account identity.** Logged-in users own their bookings/parcels
  (`passengerId`/`senderId` from the session); guests get a passenger account
  upserted by phone (booking) or a stored `senderName` (parcel, which collects
  no sender phone).

## P1 — Writes

- **Booking/parcel references** are short unambiguous codes (`AMN-`/`PKG-`,
  base32 without 0/O/1/I) stored uniquely for display and future tracking.
  `Parcel.senderId` was made optional with a `senderName` guest fallback.

## P0.2 — Schema & seed

- **Display fields added beyond §4.** To keep the data-layer return shapes exact
  and let pages render identically, three display fields were added:
  `Trip.durationMinutes Int?`, `User.rating Float?`, `User.tripsCount Int @default(0)`.
  The mock encoded per-trip durations and per-driver reputation that the schema
  had no home for; a static route table couldn't reproduce per-trip variance
  (e.g. Baghdad→Basra mocked at 330/360/320 min). New drivers created via
  `createTrip` get `tripsCount = 0` and `rating = null` (rendered as `0.0`)
  until a reviews feature exists.

- **`BookingSeat` is the source of truth for availability.** The seed creates a
  `BookingSeat` row for every booked seat. The mock's `Trip.bookedSeats` listed
  some seats with **no backing booking** (Baghdad→Basra 09:00 seat 2,
  Baghdad→Erbil seat 5, Basra→Baghdad seats 2–3). Those "phantom" seats are gone
  now that availability derives from real bookings — so a few seat maps show
  one or two more available seats than the old mock. This is intentional: a
  blocked seat with no booking is not a real state. The bookings/admin tables
  still show exactly the original four bookings.

- **First migration replaces `db push`.** `prisma migrate dev --name init`
  generated `20260627193703_init` containing the full schema incl. the
  `BookingSeat(tripId, seatNumber)` unique index. `db:push` was removed from
  npm scripts. DB data confirmed via a Prisma query (Studio is interactive and
  can't run headless here).

## Baseline / environment

- **`tsconfig.json` `target` set to `ES2017`.** The inherited config omitted
  `target`, so TypeScript defaulted to ES3 and `tsc --noEmit` failed on
  `Set`/`Map` iteration (`booking/confirmation/page.tsx`, `seat-map.tsx`,
  `data.ts`). The app still ran because Next compiles with SWC, but the
  required quality gate (`tsc --noEmit`) and `next build` type-check were red.
  `ES2017` matches the create-next-app default for Next 14 and fixes iteration
  downleveling without changing runtime behavior.

- **Local dev database.** A Postgres 16 cluster is used locally with
  `DATABASE_URL`/`DIRECT_URL` pointing at `amana:amana@127.0.0.1:5432/amana`.
  Production uses Vercel + Neon (pooled `DATABASE_URL` + `DIRECT_URL`) per the
  brief; see `.env.example`.

- **Prisma engine download via proxy.** The sandbox proxy reset Prisma's
  streaming engine download; engines were fetched with `curl` and Prisma was
  pointed at them. This is an environment workaround only — not committed.
