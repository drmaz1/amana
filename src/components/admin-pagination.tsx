import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

/**
 * Server-side pagination control. Preserves the current query params and only
 * swaps `page`. RTL: "previous" points right (ChevronRight), "next" left.
 */
export function AdminPagination({
  page,
  totalPages,
  params,
  basePath,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string | undefined>;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && k !== "page") sp.set(k, v);
    }
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <nav
      className="mt-4 flex items-center justify-center gap-2"
      aria-label="ترقيم الصفحات"
    >
      <PageLink href={href(page - 1)} disabled={page <= 1} label="السابق">
        <ChevronRight className="h-4 w-4" />
      </PageLink>
      <span className="px-2 text-sm text-muted-foreground nums">
        صفحة {arNum(page)} من {arNum(totalPages)}
      </span>
      <PageLink
        href={href(page + 1)}
        disabled={page >= totalPages}
        label="التالي"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls = cn(
    "inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors",
    disabled
      ? "pointer-events-none opacity-40"
      : "hover:bg-secondary hover:text-secondary-foreground",
  );
  if (disabled) {
    return (
      <span className={cls} aria-disabled="true">
        {children}
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={cls} aria-label={label}>
      {children}
      {label}
    </Link>
  );
}
