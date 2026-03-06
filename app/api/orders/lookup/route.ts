import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ message: "sessionId is required." }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    include: { items: true },
  });

  if (order) {
    return NextResponse.json({ order });
  }

  const checkout = await db.checkout.findUnique({
    where: { stripeSessionId: sessionId },
  });

  if (!checkout) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  if (checkout.status === "FAILED" || checkout.status === "EXPIRED") {
    return NextResponse.json(
      { message: "This checkout session is no longer active.", status: checkout.status },
      { status: 410 },
    );
  }

  return NextResponse.json({ status: checkout.status }, { status: 202 });
}
