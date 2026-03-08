"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";

import { CheckoutButton } from "@/components/store/checkout-button";
import { useCart } from "@/components/store/cart-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { AppliedCoupon } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function CartPage() {
  const {
    items,
    subtotal,
    estimatedShipping,
    updateQuantity,
    removeItem,
    couponCode,
    setCouponCode,
    clearCoupon,
  } = useCart();
  const [draftCoupon, setDraftCoupon] = useState(couponCode);
  const [couponPreview, setCouponPreview] = useState<AppliedCoupon | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const clearCouponRef = useRef(clearCoupon);

  useEffect(() => {
    setDraftCoupon(couponCode);
  }, [couponCode]);

  useEffect(() => {
    clearCouponRef.current = clearCoupon;
  }, [clearCoupon]);

  useEffect(() => {
    if (!couponCode || items.length === 0) {
      setCouponPreview(null);
      return;
    }

    let cancelled = false;

    const refreshPreview = async () => {
      try {
        const response = await fetch("/api/coupons/preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: couponCode,
            items: items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          }),
        });
        const payload = (await response.json().catch(() => null)) as
          | {
              discountAmount?: number;
              coupon?: AppliedCoupon;
              message?: string;
            }
          | null;

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload?.coupon || typeof payload.discountAmount !== "number") {
          clearCouponRef.current();
          setCouponPreview(null);
          setCouponError(payload?.message || "That coupon is no longer valid for this cart.");
          return;
        }

        setCouponPreview({
          code: payload.coupon.code,
          title: payload.coupon.title,
          description: payload.coupon.description,
          discountAmount: payload.discountAmount,
        });
      } catch {
        if (!cancelled) {
          setCouponPreview(null);
        }
      }
    };

    void refreshPreview();

    return () => {
      cancelled = true;
    };
  }, [couponCode, items]);

  const applyCoupon = async () => {
    if (!draftCoupon.trim()) {
      clearCoupon();
      setCouponPreview(null);
      setCouponMessage("");
      setCouponError("");
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponMessage("");

    try {
      const response = await fetch("/api/coupons/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: draftCoupon.trim(),
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            discountAmount?: number;
            coupon?: AppliedCoupon;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.coupon || typeof payload.discountAmount !== "number") {
        setCouponPreview(null);
        setCouponError(payload?.message || "Unable to apply coupon.");
        return;
      }

      setCouponCode(payload.coupon.code);
      setDraftCoupon(payload.coupon.code);
      setCouponPreview({
        code: payload.coupon.code,
        title: payload.coupon.title,
        description: payload.coupon.description,
        discountAmount: payload.discountAmount,
      });
      setCouponMessage(`${payload.coupon.code} applied to this cart.`);
    } catch {
      setCouponError("Unable to apply coupon.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const discountAmount = couponPreview?.discountAmount || 0;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the latest drop, add a few sizes, and come back here when you're ready to check out."
        actionLabel="Browse products"
        actionHref="/products"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.7fr,0.9fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.variantId} className="glass-panel flex flex-col gap-4 p-5 sm:flex-row">
            <img src={item.imageUrl} alt={item.title} className="aspect-[4/5] w-full max-w-[180px] rounded-[1.5rem] border border-black/10 bg-white object-cover" />
            <div className="flex flex-1 flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/products/${item.slug}`} className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink hover:text-clay">
                    {item.title}
                  </Link>
                  <p className="mt-2 text-sm text-black/65">
                    {item.size}
                    {item.color ? ` / ${item.color}` : ""}
                  </p>
                </div>
                <p className="text-lg font-semibold text-ink">{formatCurrency(item.price * item.quantity)}</p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center rounded-full border border-black/10 bg-white px-1 py-1">
                  <button className="rounded-full px-3 py-2 text-black/70 hover:text-ink" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold">{item.quantity}</span>
                  <button className="rounded-full px-3 py-2 text-black/70 hover:text-ink" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700" onClick={() => removeItem(item.variantId)}>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="glass-panel h-fit space-y-6 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Order summary</p>
          <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Ready to check out</h2>
        </div>
        <div className="space-y-3 rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
          <p className="text-sm font-semibold text-ink">Apply coupon</p>
          <div className="flex gap-3">
            <Input value={draftCoupon} onChange={(event) => setDraftCoupon(event.target.value.toUpperCase())} placeholder="WELCOME10" />
            <Button type="button" variant="ghost" onClick={applyCoupon} disabled={isApplyingCoupon}>
              {isApplyingCoupon ? "Applying..." : "Apply"}
            </Button>
          </div>
          {couponPreview ? (
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-canvas/70 px-4 py-3 text-sm text-black/65">
              <div>
                <p className="font-semibold text-ink">{couponPreview.code}</p>
                <p>{couponPreview.title}</p>
              </div>
              <button
                type="button"
                className="font-semibold text-red-600 hover:text-red-700"
                onClick={() => {
                  clearCoupon();
                  setDraftCoupon("");
                  setCouponPreview(null);
                  setCouponMessage("");
                  setCouponError("");
                }}
              >
                Remove
              </button>
            </div>
          ) : null}
          {couponMessage ? <p className="text-sm text-moss">{couponMessage}</p> : null}
          {couponError ? <p className="text-sm text-red-600">{couponError}</p> : null}
        </div>
        <div className="space-y-3 text-sm text-black/65">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 ? (
            <div className="flex items-center justify-between">
              <span>Coupon discount</span>
              <span className="font-semibold text-moss">-{formatCurrency(discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between">
            <span>Shipping estimate</span>
            <span className="font-semibold text-ink">{formatCurrency(estimatedShipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base">
            <span className="font-semibold text-ink">Estimated total</span>
            <span className="font-semibold text-ink">{formatCurrency(subtotal - discountAmount + estimatedShipping)}</span>
          </div>
        </div>
        <CheckoutButton className="w-full" size="lg" />
        <ButtonLink href="/products" variant="ghost" className="w-full">
          Continue shopping
        </ButtonLink>
        <p className="text-xs leading-6 text-black/55">
          Taxes and final shipping are confirmed in Stripe Checkout. Card payments are processed securely by Stripe.
        </p>
      </aside>
    </div>
  );
}
