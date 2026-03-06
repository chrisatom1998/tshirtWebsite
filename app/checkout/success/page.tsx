import type { Metadata } from "next";

import { OrderConfirmation } from "@/components/store/order-confirmation";

export const metadata: Metadata = {
  title: "Order confirmed",
  description: "Your payment was successful and your order is being confirmed.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const sessionId = Array.isArray(resolved.session_id) ? resolved.session_id[0] : resolved.session_id;

  return (
    <section className="section-space">
      <div className="container-shell">
        <OrderConfirmation sessionId={sessionId} />
      </div>
    </section>
  );
}
