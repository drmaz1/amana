# Decisions log

Non-obvious choices made while completing Amana per `CLAUDE.md`. Newest first.

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
