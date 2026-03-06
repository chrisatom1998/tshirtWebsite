import { CheckoutStatus, Prisma } from "@prisma/client";
import type Stripe from "stripe";

import {
  CHECKOUT_RESERVATION_MINUTES,
  CURRENCY,
  EXPRESS_SHIPPING_RATE,
  STANDARD_SHIPPING_RATE,
} from "@/lib/constants";
import { db } from "@/lib/db";
import type { CheckoutSnapshotItem } from "@/lib/types";
import { createOrderNumber } from "@/lib/utils";

export async function createCheckoutSnapshot(items: { variantId: string; quantity: number }[]) {
  const aggregatedItems = Array.from(
    items.reduce((map, item) => {
      map.set(item.variantId, (map.get(item.variantId) ?? 0) + item.quantity);
      return map;
    }, new Map<string, number>()),
  ).map(([variantId, quantity]) => ({ variantId, quantity }));

  const variants = await db.productVariant.findMany({
    where: {
      id: {
        in: aggregatedItems.map((item) => item.variantId),
      },
      isActive: true,
    },
    include: {
      product: {
        include: {
          images: {
            orderBy: { position: "asc" },
          },
        },
      },
    },
  });

  if (variants.length !== aggregatedItems.length) {
    throw new Error("One or more cart items are no longer available.");
  }

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

  const snapshot: CheckoutSnapshotItem[] = aggregatedItems.map(({ variantId, quantity }) => {
    const variant = variantMap.get(variantId);

    if (!variant) {
      throw new Error("One or more cart items are unavailable.");
    }

    if (variant.inventory < quantity) {
      throw new Error(`${variant.product.title} in ${variant.size} is out of stock.`);
    }

    const imageUrl = variant.product.images[0]?.url || "/products/placeholder.svg";

    return {
      productId: variant.productId,
      variantId: variant.id,
      title: variant.product.title,
      slug: variant.product.slug,
      imageUrl,
      sku: variant.sku ?? null,
      size: variant.size,
      color: variant.color,
      unitAmount: variant.price,
      quantity,
      totalAmount: variant.price * quantity,
    };
  });

  return {
    snapshot,
    subtotal: snapshot.reduce((sum, item) => sum + item.totalAmount, 0),
  };
}

export async function reserveCheckout(snapshot: CheckoutSnapshotItem[], subtotal: number) {
  const reservedUntil = new Date(Date.now() + CHECKOUT_RESERVATION_MINUTES * 60 * 1000);
  const productAdjustments = snapshot.reduce((map, item) => {
    map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
    return map;
  }, new Map<string, number>());

  return db.$transaction(async (tx) => {
    for (const item of snapshot) {
      const updated = await tx.productVariant.updateMany({
        where: {
          id: item.variantId,
          isActive: true,
          inventory: {
            gte: item.quantity,
          },
        },
        data: {
          inventory: {
            decrement: item.quantity,
          },
        },
      });

      if (updated.count === 0) {
        throw new Error(`${item.title} in ${item.size} is no longer in stock.`);
      }
    }

    for (const [productId, quantity] of productAdjustments.entries()) {
      await tx.product.update({
        where: { id: productId },
        data: {
          inventoryCount: {
            decrement: quantity,
          },
        },
      });
    }

    return tx.checkout.create({
      data: {
        amountSubtotal: subtotal,
        currency: CURRENCY,
        reservedUntil,
        cartSnapshot: snapshot as Prisma.InputJsonValue,
      },
    });
  });
}

export async function releaseCheckoutReservation(
  checkoutId: string,
  status: CheckoutStatus = CheckoutStatus.EXPIRED,
) {
  return db.$transaction(async (tx) => {
    const checkout = await tx.checkout.findUnique({
      where: { id: checkoutId },
    });

    if (!checkout || checkout.status !== CheckoutStatus.PENDING) {
      return checkout;
    }

    const snapshot = checkout.cartSnapshot as unknown as CheckoutSnapshotItem[];
    const productAdjustments = snapshot.reduce((map, item) => {
      map.set(item.productId, (map.get(item.productId) ?? 0) + item.quantity);
      return map;
    }, new Map<string, number>());

    for (const item of snapshot) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          inventory: {
            increment: item.quantity,
          },
        },
      });
    }

    for (const [productId, quantity] of productAdjustments.entries()) {
      await tx.product.update({
        where: { id: productId },
        data: {
          inventoryCount: {
            increment: quantity,
          },
        },
      });
    }

    return tx.checkout.update({
      where: { id: checkoutId },
      data: { status },
    });
  });
}

export async function saveStripeSessionId(checkoutId: string, stripeSessionId: string) {
  return db.checkout.update({
    where: { id: checkoutId },
    data: { stripeSessionId },
  });
}

export async function completeCheckoutFromSession(session: Stripe.Checkout.Session) {
  const checkoutId = session.metadata?.checkoutId;

  if (!checkoutId) {
    throw new Error("Checkout session metadata is missing checkoutId.");
  }

  return db.$transaction(async (tx) => {
    const checkout = await tx.checkout.findUnique({
      where: { id: checkoutId },
      include: { order: true },
    });

    if (!checkout) {
      throw new Error(`Checkout ${checkoutId} not found.`);
    }

    if (checkout.order) {
      return checkout.order;
    }

    const email = session.customer_details?.email || session.customer_email;

    if (!email) {
      throw new Error("Stripe Checkout completed without a customer email.");
    }

    const snapshot = checkout.cartSnapshot as unknown as CheckoutSnapshotItem[];
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id || null;
    const shippingAddress = session.shipping_details?.address
      ? (session.shipping_details.address as Prisma.InputJsonValue)
      : undefined;

    const order = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        checkoutId,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        email,
        customerName: session.customer_details?.name || session.shipping_details?.name || null,
        currency: checkout.currency,
        subtotal: checkout.amountSubtotal,
        shippingAmount: session.total_details?.amount_shipping ?? STANDARD_SHIPPING_RATE,
        taxAmount: session.total_details?.amount_tax ?? 0,
        total: session.amount_total ?? checkout.amountSubtotal + STANDARD_SHIPPING_RATE,
        ...(shippingAddress ? { shippingAddress } : {}),
        items: {
          create: snapshot.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            slug: item.slug,
            imageUrl: item.imageUrl,
            sku: item.sku,
            size: item.size,
            color: item.color,
            unitAmount: item.unitAmount,
            quantity: item.quantity,
            totalAmount: item.totalAmount,
          })),
        },
      },
      include: { items: true },
    });

    await tx.checkout.update({
      where: { id: checkoutId },
      data: {
        status: CheckoutStatus.COMPLETED,
        stripeSessionId: session.id,
        email,
        amountTotal: session.amount_total ?? checkout.amountSubtotal,
        customerDetails: {
          email,
          name: session.customer_details?.name || session.shipping_details?.name || null,
          phone: session.customer_details?.phone || null,
          shipping: session.shipping_details || null,
        },
      },
    });

    return order;
  });
}

export function getShippingOptions(): Stripe.Checkout.SessionCreateParams.ShippingOption[] {
  return [
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: STANDARD_SHIPPING_RATE,
          currency: CURRENCY,
        },
        display_name: "Standard shipping",
        delivery_estimate: {
          minimum: {
            unit: "business_day",
            value: 3,
          },
          maximum: {
            unit: "business_day",
            value: 7,
          },
        },
      },
    },
    {
      shipping_rate_data: {
        type: "fixed_amount",
        fixed_amount: {
          amount: EXPRESS_SHIPPING_RATE,
          currency: CURRENCY,
        },
        display_name: "Express shipping",
        delivery_estimate: {
          minimum: {
            unit: "business_day",
            value: 1,
          },
          maximum: {
            unit: "business_day",
            value: 3,
          },
        },
      },
    },
  ];
}
