"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Settings, Ticket, User } from "lucide-react";

import { logout } from "@/lib/actions/auth";
import type { Role } from "@/lib/session-token";

const ROLE_LABEL: Record<Role, string> = {
  PASSENGER: "راكب",
  DRIVER: "سائق",
  ADMIN: "مدير",
};

export function UserMenu({
  name,
  role,
  demo,
}: {
  name: string;
  role: Role;
  demo: boolean;
}) {
  const ref = React.useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const initial = name.trim().charAt(0) || "؟";

  // Close on navigation.
  React.useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  // Close on outside click.
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ref.current.open = false;
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border bg-background py-1 pe-2 ps-1 text-sm font-medium transition-colors hover:bg-secondary [&::-webkit-details-marker]:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[6rem] truncate sm:inline">{name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute end-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
        <div className="px-3 py-2">
          <div className="truncate font-semibold">{name}</div>
          <div className="text-xs text-muted-foreground">
            {ROLE_LABEL[role]}
            {demo ? " · وضع العرض" : ""}
          </div>
        </div>
        <div className="h-px bg-border" />
        <MenuLink href="/me" icon={<Ticket className="h-4 w-4" />}>
          رحلاتي وأماناتي
        </MenuLink>
        <MenuLink href="/account" icon={<User className="h-4 w-4" />}>
          الملف الشخصي
        </MenuLink>
        <MenuLink href="/settings" icon={<Settings className="h-4 w-4" />}>
          الإعدادات
        </MenuLink>
        {!demo && (
          <>
            <div className="h-px bg-border" />
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </form>
          </>
        )}
      </div>
    </details>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
    >
      {icon}
      {children}
    </Link>
  );
}
