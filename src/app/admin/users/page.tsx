import Link from "next/link";
import { ChevronRight, Star, UsersRound } from "lucide-react";

import { getUsers } from "@/lib/data";
import { toLocalPhone } from "@/lib/phone";
import { requireRole, type Role } from "@/lib/session";
import { formatArabicDate } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { AdminPagination } from "@/components/admin-pagination";
import { AdminRoleControl } from "@/components/admin-role-control";
import { AdminUserFilters } from "@/components/admin-user-filters";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "إدارة المستخدمين" };

const PAGE_SIZE = 10;
const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);
const VALID_ROLES = ["PASSENGER", "DRIVER", "ADMIN"] as const;

function parseRole(v?: string): Role | undefined {
  return VALID_ROLES.includes(v as Role) ? (v as Role) : undefined;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; page?: string };
}) {
  await requireRole("ADMIN", "/admin/users");

  const q = searchParams.q?.trim() || undefined;
  const role = parseRole(searchParams.role);
  const page = Math.max(1, Number(searchParams.page) || 1);

  const { rows, total } = await getUsers({ q, role, page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          href="/admin"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
          لوحة الإدارة
        </Link>
        <h1 className="flex items-center gap-2 font-display text-xl font-bold">
          <UsersRound className="h-5 w-5 text-primary" />
          إدارة المستخدمين
        </h1>
        <p className="text-sm text-muted-foreground">
          {arNum(total)} مستخدم — ابحث، صفِّ حسب الدور، وغيّر الصلاحيات.
        </p>
      </div>

      <AdminUserFilters />

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            لا مستخدمين مطابقين لبحثك.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  {["المستخدم", "الهاتف", "السمعة", "عضو منذ", "الدور"].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-2.5 text-start font-medium"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                          {u.name.trim().charAt(0) || "؟"}
                        </span>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-middle text-muted-foreground nums">
                      {toLocalPhone(u.phone) ?? u.phone}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-middle">
                      {u.role === "DRIVER" ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                          <span className="nums">
                            {u.rating ? u.rating.toFixed(1) : "—"}
                          </span>
                          <span className="opacity-50">·</span>
                          <span className="nums">{arNum(u.tripsCount)}</span> رحلة
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 align-middle text-muted-foreground nums">
                      {formatArabicDate(u.createdAt)}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <AdminRoleControl userId={u.id} role={u.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        params={{ q: searchParams.q, role: searchParams.role }}
        basePath="/admin/users"
      />
    </AppShell>
  );
}
