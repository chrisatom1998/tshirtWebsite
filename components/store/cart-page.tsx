"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { CheckoutButton } from "@/components/store/checkout-button";
import { useCart } from "@/components/store/cart-provider";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

export function CartPage() {
  const { items, subtotal, estimatedShipping, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Browse the latest drop, add a few sizes, and come back here when youâ€™re ready to check out."
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
                    {item.size}{item.color ? ` Â· ${item.color}` : ""}
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
        <div className="space-y-3 text-sm text-black/65">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping estimate</span>
            <span className="font-semibold text-ink">{formatCurrency(estimatedShipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base">
            <span className="font-semibold text-ink">Estimated total</span>
            <span className="font-semibold text-ink">{formatCurrency(subtotal + estimatedShipping)}</span>
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
