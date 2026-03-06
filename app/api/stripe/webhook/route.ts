import type Stripe from "stripe";

import { CheckoutStatus } from "@prisma/client";
import { NextResponse } from "next/server";

import { completeCheckoutFromSession, releaseCheckoutReservation } from "@/lib/checkout";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Webhook secret is not configured." }, { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Invalid webhook signature." },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await completeCheckoutFromSession(event.data.object as Stripe.Checkout.Session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const checkoutId = session.metadata?.checkoutId;
        if (checkoutId) {
          await releaseCheckoutReservation(checkoutId, CheckoutStatus.EXPIRED);
        }
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const checkoutId = session.metadata?.checkoutId;
        if (checkoutId) {
          await releaseCheckoutReservation(checkoutId, CheckoutStatus.FAILED);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook processing failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
