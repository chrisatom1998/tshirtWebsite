"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/store/cart-provider";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type OrderResponse = {
  order?: {
    orderNumber: string;
    createdAt: string;
    email: string;
    total: number;
    shippingAmount: number;
    taxAmount: number;
    discountAmount: number;
    couponCode?: string | null;
    items: Array<{
      id: string;
      title: string;
      size: string;
      color: string;
      quantity: number;
      totalAmount: number;
      imageUrl?: string | null;
    }>;
  };
  message?: string;
  status?: string;
};

export function OrderConfirmation({ sessionId }: { sessionId?: string }) {
  const { clearCart, clearCoupon } = useCart();
  const clearCartRef = useRef(clearCart);
  const clearCouponRef = useRef(clearCoupon);
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; order: NonNullable<OrderResponse["order"]> } | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    clearCartRef.current = clearCart;
    clearCouponRef.current = clearCoupon;
  }, [clearCart, clearCoupon]);

  useEffect(() => {
    if (!sessionId) {
      setState({ status: "error", message: "Missing Stripe session id." });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/orders/lookup?sessionId=${sessionId}`, { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as OrderResponse | null;

        if (cancelled) {
          return;
        }

        if (response.status === 202) {
          timer = setTimeout(poll, 1500);
          return;
        }

        if (!response.ok || !payload?.order) {
          setState({
            status: "error",
            message: payload?.message || "We could not confirm your order yet. Refresh in a moment.",
          });
          return;
        }

        clearCartRef.current();
        clearCouponRef.current();
        setState({ status: "ready", order: payload.order });
      } catch {
        setState({
          status: "error",
          message: "We could not confirm your order yet. Refresh in a moment.",
        });
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [sessionId]);

  if (state.status === "loading") {
    return (
      <div className="glass-panel space-y-4 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Order processing</p>
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-ink">We&apos;re confirming your payment</h1>
        <p className="max-w-2xl text-base leading-8 text-black/70">
          Stripe has redirected you back successfully. The order record appears here as soon as the webhook is processed.
        </p>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="glass-panel space-y-4 p-8">
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-ink">Order confirmation pending</h1>
        <p className="max-w-2xl text-base leading-8 text-black/70">{state.message}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/products">Back to shop</ButtonLink>
          <ButtonLink href="/cart" variant="ghost">
            Return to cart
          </ButtonLink>
        </div>
      </div>
    );
  }

  const { order } = state;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
      <div className="glass-panel space-y-6 p-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Order confirmed</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-ink">Thanks for your purchase</h1>
          <p className="text-base leading-8 text-black/70">
            Order <span className="font-semibold text-ink">{order.orderNumber}</span> has been paid and saved.
          </p>
        </div>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
              <img
                src={item.imageUrl || "/products/placeholder.svg"}
                alt={item.title}
                className="h-24 w-20 rounded-2xl border border-black/10 bg-white object-cover"
              />
              <div className="space-y-2">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-sm text-black/65">
                  {item.size}
                  {item.color ? ` / ${item.color}` : ""} / Qty {item.quantity}
                </p>
                <p className="text-sm font-semibold text-ink">{formatCurrency(item.totalAmount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <aside className="glass-panel h-fit space-y-4 p-8">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Receipt details</h2>
        <div className="space-y-2 text-sm text-black/65">
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span className="font-medium text-ink">{order.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Date</span>
            <span className="font-medium text-ink">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          {order.discountAmount > 0 ? (
            <div className="flex items-center justify-between">
              <span>Coupon</span>
              <span className="font-medium text-ink">
                {order.couponCode || "Applied"} (-{formatCurrency(order.discountAmount)})
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span>Shipping</span>
            <span className="font-medium text-ink">{formatCurrency(order.shippingAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span className="font-medium text-ink">{formatCurrency(order.taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base">
            <span className="font-semibold text-ink">Total paid</span>
            <span className="font-semibold text-ink">{formatCurrency(order.total)}</span>
          </div>
        </div>
        <div className="grid gap-3">
          <ButtonLink href="/products">Shop another drop</ButtonLink>
          <ButtonLink href="/account" variant="ghost">
            View your account
          </ButtonLink>
          <Link href={`/support?order=${encodeURIComponent(order.orderNumber)}`} className="text-sm font-medium text-black/55 hover:text-ink">
            Need help with this order?
          </Link>
        </div>
      </aside>
    </div>
  );
}
