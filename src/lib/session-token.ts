import { SignJWT, jwtVerify } from "jose";

/**
 * Pure JWT session logic — no `next/headers`, so it is safe to import from the
 * edge middleware as well as from Node server code.
 */

export const SESSION_COOKIE = "amana_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type Role = "PASSENGER" | "DRIVER" | "ADMIN";
export type SessionPayload = { userId: string; role: Role; name: string };

const ROLE_RANK: Record<Role, number> = { PASSENGER: 0, DRIVER: 1, ADMIN: 2 };

/** True when `role` is at least as privileged as `min`. */
export function roleAtLeast(role: Role, min: Role): boolean {
  return (ROLE_RANK[role] ?? -1) >= ROLE_RANK[min];
}

function secret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const role = payload.role as Role | undefined;
    if (!payload.sub || !role) return null;
    return { userId: payload.sub, role, name: (payload.name as string) ?? "" };
  } catch {
    return null;
  }
}
