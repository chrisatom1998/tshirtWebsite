import type { Metadata } from "next";

import { CartPage } from "@/components/store/cart-page";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selected t-shirts and continue to secure checkout.",
};

export default function CartRoute() {
  return (
    <section className="section-space">
      <div className="container-shell space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Cart</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Review your order</h1>
        </div>
        <CartPage />
      </div>
    </section>
  );
}
