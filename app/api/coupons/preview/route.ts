import { NextResponse } from "next/server";

import { createCheckoutSnapshot } from "@/lib/checkout";
import { couponPreviewSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const payload = couponPreviewSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json(
      {
        message: "Coupon payload is invalid.",
        errors: payload.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const { subtotal, discountAmount, coupon } = await createCheckoutSnapshot(payload.data.items, payload.data.code);

    if (!coupon) {
      return NextResponse.json({ message: "That coupon code is invalid." }, { status: 404 });
    }

    return NextResponse.json({
      subtotal,
      discountAmount,
      coupon,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to validate coupon.",
      },
      { status: 400 },
    );
  }
}
