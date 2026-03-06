"use client";

import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";

export function CartButton() {
  const { itemCount, toggleCart } = useCart();

  return (
    <Button variant="ghost" className="gap-2" onClick={toggleCart} aria-label="Open cart">
      <ShoppingBag className="h-4 w-4" />
      Cart
      <span className="rounded-full bg-ink px-2 py-0.5 text-xs text-white">{itemCount}</span>
    </Button>
  );
}
