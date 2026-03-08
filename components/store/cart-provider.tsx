"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { CART_STORAGE_KEY, COUPON_STORAGE_KEY, STANDARD_SHIPPING_RATE } from "@/lib/constants";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  estimatedShipping: number;
  isHydrated: boolean;
  isOpen: boolean;
  couponCode: string;
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  setCouponCode: (code: string) => void;
  clearCoupon: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readCartFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function readCouponCodeFromStorage() {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(COUPON_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(readCartFromStorage());
    setCouponCode(readCouponCodeFromStorage());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isHydrated, items]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (couponCode.trim()) {
      window.localStorage.setItem(COUPON_STORAGE_KEY, couponCode.trim());
    } else {
      window.localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [couponCode, isHydrated]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedShipping = itemCount > 0 ? STANDARD_SHIPPING_RATE : 0;

  const addItem = (incoming: CartItem) => {
    setItems((current) => {
      const existing = current.find((item) => item.variantId === incoming.variantId);

      if (!existing) {
        return [...current, incoming];
      }

      return current.map((item) =>
        item.variantId === incoming.variantId
          ? {
              ...item,
              quantity: Math.min(item.quantity + incoming.quantity, item.inventory),
            }
          : item,
      );
    });

    setIsOpen(true);
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.variantId !== variantId) {
          return [item];
        }

        if (quantity <= 0) {
          return [];
        }

        return [
          {
            ...item,
            quantity: Math.min(quantity, item.inventory),
          },
        ];
      }),
    );
  };

  const removeItem = (variantId: string) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode("");
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        estimatedShipping,
        isHydrated,
        isOpen,
        couponCode,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setCouponCode,
        clearCoupon: () => setCouponCode(""),
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((open) => !open),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
