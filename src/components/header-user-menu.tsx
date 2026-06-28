import Link from "next/link";
import { LogIn } from "lucide-react";

import { isDemoMode } from "@/lib/demo";
import { getSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";

/**
 * The only place the header reads the session cookie. Kept in its own async
 * server component so it can be excluded from the static not-found/error shells
 * (which must not call cookies()).
 */
export async function HeaderUserMenu() {
  const session = await getSession();
  if (!session) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login">
          <LogIn className="h-4 w-4" />
          دخول
        </Link>
      </Button>
    );
  }
  return (
    <UserMenu name={session.name} role={session.role} demo={isDemoMode()} />
  );
}
