import { NextResponse, type NextRequest } from "next/server";

import {
  SESSION_COOKIE,
  roleAtLeast,
  verifySession,
  type Role,
} from "@/lib/session-token";

/**
 * Gate the role-restricted areas:
 *   /driver* → DRIVER or ADMIN
 *   /admin*  → ADMIN
 * Unauthenticated users are sent to /login?next=…; signed-in users without the
 * required role are sent home.
 */
export async function middleware(req: NextRequest) {
  // Demo mode (no database) → no auth, everything open.
  if (!process.env.DATABASE_URL) return NextResponse.next();

  const { pathname } = req.nextUrl;
  const needed: Role | null = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/driver")
      ? "DRIVER"
      : null;
  if (!needed) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  if (!roleAtLeast(session.role, needed)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/driver", "/driver/:path*", "/admin", "/admin/:path*"],
};
