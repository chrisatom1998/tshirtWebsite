"use client";

import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";

import { CheckoutButton } from "@/components/store/checkout-button";
import { useCart } from "@/components/store/cart-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, subtotal, estimatedShipping, isOpen, closeCart, updateQuantity, removeItem } = useCart();

  return (
    <>
      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-black/30 transition ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeCart}
      />
      <aside
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-black/10 bg-card shadow-2xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Bag</p>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink">Your picks</h2>
          </div>
          <Button variant="ghost" className="h-10 w-10 rounded-full p-0" onClick={closeCart}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="glass-panel space-y-3 p-6">
              <p className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink">Cart is empty</p>
              <p className="text-sm leading-7 text-black/65">
                Add a shirt to start checkout. Your cart stays saved between refreshes.
              </p>
              <ButtonLink href="/products" variant="secondary" onClick={closeCart}>
                Shop now
              </ButtonLink>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.variantId} className="glass-panel flex gap-4 p-4">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-24 w-20 rounded-2xl border border-black/10 bg-white object-cover"
                />
                <div className="flex flex-1 flex-col gap-3">
                  <div>
                    <Link href={`/products/${item.slug}`} className="font-semibold text-ink hover:text-clay" onClick={closeCart}>
                      {item.title}
                    </Link>
                    <p className="text-sm text-black/55">
                      {item.size}{item.color ? ` · ${item.color}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-ink">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-full border border-black/10 bg-white">
                      <button
                        className="px-3 py-2 text-black/70 hover:text-ink"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="px-3 py-2 text-black/70 hover:text-ink"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-sm font-medium text-red-600 hover:text-red-700" onClick={() => removeItem(item.variantId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-5 border-t border-black/10 px-6 py-6">
          <div className="space-y-2 text-sm text-black/65">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated shipping</span>
              <span className="font-semibold text-ink">{items.length ? formatCurrency(estimatedShipping) : "-"}</span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink href="/cart" variant="ghost" onClick={closeCart}>
              View cart
            </ButtonLink>
            <CheckoutButton className="w-full" variant="secondary" />
          </div>
        </div>
      </aside>
    </>
  );
}
