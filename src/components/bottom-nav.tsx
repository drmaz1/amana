"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Search, Ticket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: "/", label: "الرئيسية", icon: Home, match: (p) => p === "/" },
  { href: "/search", label: "بحث", icon: Search, match: (p) => p.startsWith("/search") || p.startsWith("/trips") },
  { href: "/parcels/new", label: "أمانة", icon: Package, match: (p) => p.startsWith("/parcels") },
  { href: "/me", label: "رحلاتي", icon: Ticket, match: (p) => p.startsWith("/me") || p.startsWith("/track") },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <ul className="container grid grid-cols-4 px-0">
        {ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
