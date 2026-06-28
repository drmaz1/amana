"use server";

import { isDemoMode } from "@/lib/demo";
import { logError } from "@/lib/log";
import { prisma } from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/session";
import { profileUpdateSchema, type ProfileUpdateInput } from "@/lib/validation";
import { actionError, type ActionResult } from "./types";

/**
 * Update the signed-in user's display name. Re-mints the session cookie so the
 * header reflects the new name without a re-login. No-op-but-optimistic in demo.
 */
export async function updateProfile(
  input: ProfileUpdateInput,
): Promise<ActionResult<{ name: string }>> {
  const session = await getSession();
  if (!session) return actionError("يجب تسجيل الدخول", "UNAUTHENTICATED");

  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const { name } = parsed.data;

  if (isDemoMode()) return { ok: true, name };

  try {
    await prisma.user.update({ where: { id: session.userId }, data: { name } });
    await setSessionCookie({ userId: session.userId, role: session.role, name });
    return { ok: true, name };
  } catch (e) {
    logError("updateProfile", e);
    return actionError("تعذّر حفظ الاسم. حاول مرة أخرى.", "UNKNOWN");
  }
}
