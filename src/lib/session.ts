import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEMO_SESSION, isDemoMode } from "./demo";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  roleAtLeast,
  signSession,
  verifySession,
  type Role,
  type SessionPayload,
} from "./session-token";

export type { Role, SessionPayload } from "./session-token";

/** Current session, or null if not signed in. Safe in server components. */
export async function getSession(): Promise<SessionPayload | null> {
  if (isDemoMode()) return DEMO_SESSION; // no auth without a database
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Mint and store the httpOnly session cookie. Call only from a server action. */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clear the session cookie. Call only from a server action. */
export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** Require a signed-in user, else redirect to login (preserving `next`). */
export async function requireUser(next?: string): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(loginUrl(next));
  return session;
}

/** Require at least `min` role, else redirect. */
export async function requireRole(
  min: Role,
  next?: string,
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect(loginUrl(next));
  if (!roleAtLeast(session.role, min)) redirect("/");
  return session;
}

function loginUrl(next?: string): string {
  return `/login${next ? `?next=${encodeURIComponent(next)}` : ""}`;
}
