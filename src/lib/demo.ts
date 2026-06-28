import type { SessionPayload } from "./session-token";

/**
 * Demo mode — when no database is configured the whole app runs on in-memory
 * mock data, with auth and route protection disabled, so it can be browsed
 * end-to-end without any setup. Set `DATABASE_URL` to switch to the real,
 * DB-backed behavior automatically.
 */
export function isDemoMode(): boolean {
  return !process.env.DATABASE_URL;
}

/** Synthetic admin session used so every page renders in demo mode. */
export const DEMO_SESSION: SessionPayload = {
  userId: "demo-user",
  role: "ADMIN",
  name: "زائر",
};

let demoCounter = 1000;
/** A throwaway reference for demo writes (no DB), e.g. "AMN-4827". */
export function demoReference(prefix: string): string {
  demoCounter += 1;
  return `${prefix}-${demoCounter}`;
}
