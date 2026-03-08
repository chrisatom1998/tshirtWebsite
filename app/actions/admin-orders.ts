"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { orderUpdateSchema } from "@/lib/validators";

export async function updateOrderAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = orderUpdateSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    shippingCarrier: formData.get("shippingCarrier"),
    trackingNumber: formData.get("trackingNumber"),
    fulfillmentNotes: formData.get("fulfillmentNotes"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the fulfillment fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const order = await db.order.findUnique({
    where: { id: parsed.data.orderId },
    select: {
      id: true,
      fulfilledAt: true,
      shippedAt: true,
      deliveredAt: true,
    },
  });

  if (!order) {
    return {
      status: "error",
      message: "Order not found.",
    };
  }

  const nextData: Record<string, unknown> = {
    status: parsed.data.status,
    shippingCarrier: parsed.data.shippingCarrier?.trim() || null,
    trackingNumber: parsed.data.trackingNumber?.trim() || null,
    fulfillmentNotes: parsed.data.fulfillmentNotes?.trim() || null,
  };

  if (
    (parsed.data.status === OrderStatus.FULFILLED ||
      parsed.data.status === OrderStatus.SHIPPED ||
      parsed.data.status === OrderStatus.DELIVERED) &&
    !order.fulfilledAt
  ) {
    nextData.fulfilledAt = new Date();
  }

  if ((parsed.data.status === OrderStatus.SHIPPED || parsed.data.status === OrderStatus.DELIVERED) && !order.shippedAt) {
    nextData.shippedAt = new Date();
  }

  if (parsed.data.status === OrderStatus.DELIVERED && !order.deliveredAt) {
    nextData.deliveredAt = new Date();
  }

  await db.order.update({
    where: { id: order.id },
    data: nextData,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/account");

  return {
    status: "success",
    message: "Order updated.",
  };
}
