import { CouponType, type Coupon } from "@prisma/client";

import { db } from "@/lib/db";
import { normalizeCouponCode } from "@/lib/utils";

export type CouponSummary = {
  couponId: string;
  code: string;
  title: string;
  description: string | null;
  type: CouponType;
  amount: number;
  minimumSubtotal: number;
  discountAmount: number;
};

export function calculateCouponDiscount(coupon: Pick<Coupon, "type" | "amount">, subtotal: number) {
  if (subtotal <= 0) {
    return 0;
  }

  if (coupon.type === CouponType.PERCENTAGE) {
    return Math.min(subtotal, Math.floor((subtotal * coupon.amount) / 100));
  }

  return Math.min(subtotal, coupon.amount);
}

function getCouponError(coupon: Coupon | null, subtotal: number, now = new Date()) {
  if (!coupon) {
    return "That coupon code does not exist.";
  }

  if (!coupon.isActive) {
    return "That coupon is inactive.";
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    return "That coupon is not active yet.";
  }

  if (coupon.endsAt && coupon.endsAt < now) {
    return "That coupon has expired.";
  }

  if (coupon.minimumSubtotal > subtotal) {
    return `This coupon requires a subtotal of at least $${(coupon.minimumSubtotal / 100).toFixed(2)}.`;
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return "That coupon has already reached its usage limit.";
  }

  return null;
}

export async function getCouponSummary(code: string | undefined | null, subtotal: number): Promise<CouponSummary | null> {
  if (!code?.trim()) {
    return null;
  }

  const coupon = await db.coupon.findUnique({
    where: {
      code: normalizeCouponCode(code),
    },
  });

  const error = getCouponError(coupon, subtotal);

  if (error) {
    throw new Error(error);
  }

  if (!coupon) {
    throw new Error("That coupon code does not exist.");
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    title: coupon.title,
    description: coupon.description,
    type: coupon.type,
    amount: coupon.amount,
    minimumSubtotal: coupon.minimumSubtotal,
    discountAmount: calculateCouponDiscount(coupon, subtotal),
  };
}
