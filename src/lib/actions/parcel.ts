"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { estimateParcelPrice } from "@/lib/pricing";
import { generateReference } from "@/lib/reference";
import { parcelSchema, type ParcelInput } from "@/lib/validation";
import { actionError, type ActionResult } from "./types";

/**
 * Create a parcel request. The price is computed on the server from the same
 * pricing module the form uses, so the persisted price always matches the
 * shown estimate. The sender is stored as a guest name until auth (P2).
 */
export async function createParcel(
  input: ParcelInput,
): Promise<ActionResult<{ reference: string; price: number }>> {
  const parsed = parcelSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(
      parsed.error.issues[0]?.message ?? "بيانات غير صالحة",
      "VALIDATION",
    );
  }
  const {
    originId,
    destinationId,
    senderName,
    receiverName,
    receiverPhone,
    description,
    weightKg,
  } = parsed.data;
  const price = estimateParcelPrice(weightKg ?? 1);

  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const parcel = await prisma.parcel.create({
        data: {
          reference: generateReference("PKG"),
          originId,
          destinationId,
          senderName, // guest sender; senderId set from the session in P2
          receiverName,
          receiverPhone,
          description,
          weightKg: weightKg ?? null,
          price,
          status: "REQUESTED",
        },
        select: { reference: true },
      });
      revalidatePath("/admin");
      return { ok: true, reference: parcel.reference, price };
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue; // reference collision — retry with a fresh code
      }
      console.error("createParcel failed:", e);
      return actionError("حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.", "UNKNOWN");
    }
  }
  return actionError("تعذّر إنشاء الطلب. حاول مرة أخرى.", "RETRY");
}
