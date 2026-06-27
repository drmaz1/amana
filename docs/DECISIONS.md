# Decisions log

Non-obvious choices made while completing Amana per `CLAUDE.md`. Newest first.

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
