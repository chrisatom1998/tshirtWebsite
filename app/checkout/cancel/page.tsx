import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Checkout canceled",
  description: "Return to your cart or continue shopping.",
};

export default function CheckoutCancelPage() {
  return (
    <section className="section-space">
      <div className="container-shell">
        <div className="glass-panel max-w-3xl space-y-6 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Checkout canceled</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Your cart is still waiting</h1>
          <p className="max-w-2xl text-base leading-8 text-black/70">
            Stripe sent you back without taking payment. Nothing was charged. If you still want the items, return to the cart and start checkout again.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/cart">Back to cart</ButtonLink>
            <ButtonLink href="/products" variant="ghost">
              Continue shopping
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
