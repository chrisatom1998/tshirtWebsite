"use client";

import { useState, useTransition } from "react";

import { useCart } from "@/components/store/cart-provider";
import { Button, type ButtonProps } from "@/components/ui/button";

export function CheckoutButton({
  children = "Secure checkout",
  ...props
}: ButtonProps & { children?: React.ReactNode }) {
  const { items, isHydrated } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const beginCheckout = () => {
    startTransition(() => {
      void (async () => {
        try {
          setError("");

          const response = await fetch("/api/checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            }),
          });

          const payload = await response.json().catch(() => null);

          if (!response.ok || !payload?.url) {
            setError(payload?.message || "Unable to start checkout.");
            return;
          }

          window.location.assign(payload.url);
        } catch {
          setError("Unable to start checkout.");
        }
      })();
    });
  };

  return (
    <div className="space-y-2">
      <Button {...props} disabled={!isHydrated || items.length === 0 || isPending || props.disabled} onClick={beginCheckout}>
        {isPending ? "Redirecting..." : children}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
