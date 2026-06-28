"use server";

import { createHash, randomInt } from "node:crypto";

import { logError } from "@/lib/log";
import { toLocalPhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import { getSmsProvider } from "@/lib/sms";
import {
  otpRequestSchema,
  otpVerifySchema,
  type OtpRequestInput,
  type OtpVerifyInput,
} from "@/lib/validation";
import { actionError, type ActionResult } from "./types";

const CODE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000;

function hashCode(code: string, phone: string): string {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHash("sha256").update(`${code}:${phone}:${secret}`).digest("hex");
}

/**
 * Generate and "send" a 6-digit OTP for a phone. Rate-limited per phone. In dev
 * the code is also returned (and printed by the console SMS provider) so it can
 * be entered without a real gateway.
 */
export async function requestOtp(
  input: OtpRequestInput,
): Promise<ActionResult<{ devCode?: string }>> {
  const parsed = otpRequestSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "رقم غير صالح", "VALIDATION");
  }
  const { phone } = parsed.data; // normalized E.164
  const now = Date.now();

  const recent = await prisma.otpCode.findMany({
    where: { phone, createdAt: { gt: new Date(now - WINDOW_MS) } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent.length >= MAX_PER_WINDOW) {
    return actionError("محاولات كثيرة. حاول بعد قليل.", "RATE_LIMIT");
  }
  if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return actionError("انتظر قليلاً قبل طلب رمز جديد.", "COOLDOWN");
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.otpCode.create({
    data: {
      phone,
      codeHash: hashCode(code, phone),
      expiresAt: new Date(now + CODE_TTL_MS),
    },
  });

  try {
    await getSmsProvider().send(phone, `رمز الدخول إلى أمانة: ${code}`);
  } catch (e) {
    logError("requestOtp.sms", e);
    return actionError("تعذّر إرسال رمز التحقق. حاول مرة أخرى.", "SMS_FAILED");
  }

  return {
    ok: true,
    devCode: process.env.NODE_ENV !== "production" ? code : undefined,
  };
}

/**
 * Verify an OTP. On success upserts the user by phone and mints the session.
 */
export async function verifyOtp(
  input: OtpVerifyInput,
): Promise<ActionResult<{ role: string }>> {
  const parsed = otpVerifySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "بيانات غير صالحة", "VALIDATION");
  }
  const { phone, code } = parsed.data;

  const otp = await prisma.otpCode.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) {
    return actionError("انتهت صلاحية الرمز أو لم يُطلب. اطلب رمزاً جديداً.", "NO_CODE");
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    return actionError("تجاوزت عدد المحاولات. اطلب رمزاً جديداً.", "TOO_MANY");
  }
  if (otp.codeHash !== hashCode(code, phone)) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return actionError("رمز غير صحيح.", "WRONG_CODE");
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  const user = await prisma.user.upsert({
    where: { phone },
    create: { name: toLocalPhone(phone) ?? phone, phone, role: "PASSENGER" },
    update: {},
    select: { id: true, role: true, name: true },
  });
  await setSessionCookie({ userId: user.id, role: user.role, name: user.name });
  return { ok: true, role: user.role };
}

export async function logout(): Promise<void> {
  clearSessionCookie();
}
