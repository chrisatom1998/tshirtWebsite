"use server";

import { CouponType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { normalizeCouponCode, parsePriceInput } from "@/lib/utils";
import { couponFormSchema } from "@/lib/validators";

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  return value;
}

export async function saveCouponAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = couponFormSchema.safeParse({
    id: String(formData.get("id") || "") || undefined,
    title: formData.get("title"),
    code: formData.get("code"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    amount: formData.get("amount"),
    minimumSubtotal: parseOptionalNumber(formData.get("minimumSubtotal")),
    usageLimit: parseOptionalNumber(formData.get("usageLimit")),
    startsAt: parseOptionalDate(formData.get("startsAt")),
    endsAt: parseOptionalDate(formData.get("endsAt")),
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the coupon fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const amount =
    parsed.data.type === CouponType.PERCENTAGE ? Math.round(parsed.data.amount) : parsePriceInput(parsed.data.amount);
  const minimumSubtotal = parsed.data.minimumSubtotal ? parsePriceInput(parsed.data.minimumSubtotal) : 0;
  const baseData = {
    title: parsed.data.title.trim(),
    code: normalizeCouponCode(parsed.data.code),
    description: parsed.data.description?.trim() || null,
    type: parsed.data.type,
    amount,
    minimumSubtotal,
    usageLimit: parsed.data.usageLimit ?? null,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    isActive: parsed.data.isActive,
  };

  try {
    if (parsed.data.id) {
      await db.coupon.update({
        where: { id: parsed.data.id },
        data: baseData,
      });
    } else {
      await db.coupon.create({
        data: baseData,
      });
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save coupon.",
    };
  }

  revalidatePath("/admin/coupons");

  return {
    status: "success",
    message: parsed.data.id ? "Coupon updated." : "Coupon created.",
  };
}
