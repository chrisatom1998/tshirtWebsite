import { CheckoutStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCustomerSession } from "@/lib/auth";
import { CURRENCY } from "@/lib/constants";
import {
  createCheckoutSnapshot,
  getShippingOptions,
  releaseCheckoutReservation,
  reserveCheckout,
  saveStripeSessionId,
} from "@/lib/checkout";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { checkoutRequestSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ message: "Stripe is not configured." }, { status: 500 });
  }

  const payload = checkoutRequestSchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json(
      {
        message: "Your cart payload is invalid.",
        errors: payload.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const customerSession = await getCustomerSession();
    const { snapshot, subtotal, coupon, discountAmount } = await createCheckoutSnapshot(
      payload.data.items,
      payload.data.couponCode,
    );
    const checkout = await reserveCheckout({
      snapshot,
      subtotal,
      discountAmount,
      coupon,
      customerId: customerSession?.userId,
      email: customerSession?.email,
    });
    const origin = request.headers.get("origin") || new URL(request.url).origin;

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        customer_creation: "always",
        ...(customerSession?.email ? { customer_email: customerSession.email } : {}),
        billing_address_collection: "required",
        shipping_address_collection: {
          allowed_countries: ["US", "CA", "GB", "AU"],
        },
        phone_number_collection: { enabled: true },
        automatic_tax: { enabled: true },
        submit_type: "pay",
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        expires_at: Math.floor(checkout.reservedUntil.getTime() / 1000),
        metadata: {
          checkoutId: checkout.id,
        },
        shipping_options: getShippingOptions(),
        line_items: snapshot.map((item) => ({
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: item.totalAmount,
            product_data: {
              name: item.title,
              description: [item.size, item.color, `Qty ${item.quantity}`].filter(Boolean).join(" · "),
              images: [absoluteUrl(item.imageUrl, origin)],
            },
          },
        })),
      });

      if (!session.url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      await saveStripeSessionId(checkout.id, session.id);

      return NextResponse.json({
        url: session.url,
      });
    } catch (error) {
      await releaseCheckoutReservation(checkout.id, CheckoutStatus.FAILED);
      throw error;
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Unable to start checkout.",
      },
      { status: 400 },
    );
  }
}
