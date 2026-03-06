"use client";

import { useEffect, useState } from "react";

import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Variant = {
  id: string;
  size: string;
  color: string;
  price: number;
  inventory: number;
};

export function AddToCartForm({
  product,
}: {
  product: {
    id: string;
    title: string;
    slug: string;
    images: { url: string; alt: string }[];
    variants: Variant[];
    sizes: string[];
    colors: string[];
  };
}) {
  const { addItem } = useCart();
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || "");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");

  const matchingVariant =
    product.variants.find((variant) => variant.color === selectedColor && variant.size === selectedSize) ||
    product.variants.find((variant) => variant.color === selectedColor) ||
    product.variants.find((variant) => variant.size === selectedSize) ||
    product.variants[0];

  useEffect(() => {
    if (!matchingVariant) {
      return;
    }

    if (matchingVariant.color !== selectedColor) {
      setSelectedColor(matchingVariant.color);
    }

    if (matchingVariant.size !== selectedSize) {
      setSelectedSize(matchingVariant.size);
    }
  }, [matchingVariant, selectedColor, selectedSize]);

  useEffect(() => {
    if (matchingVariant && quantity > matchingVariant.inventory) {
      setQuantity(Math.max(1, matchingVariant.inventory));
    }
  }, [matchingVariant, quantity]);

  if (!matchingVariant) {
    return null;
  }

  const imageUrl = product.images[0]?.url || "/products/placeholder.svg";

  return (
    <div className="glass-panel space-y-8 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-black/45">Build your fit</p>
        <p className="text-3xl font-semibold text-ink">{formatCurrency(matchingVariant.price)}</p>
        <p className="text-sm text-black/65">
          {matchingVariant.inventory > 0 ? `${matchingVariant.inventory} ready to ship` : "Sold out"}
        </p>
      </div>

      {product.colors.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Color</p>
          <div className="flex flex-wrap gap-3">
            {product.colors.map((color) => {
              const colorVariant = product.variants.find((variant) => variant.color === color && variant.inventory > 0);
              const isAvailable = Boolean(colorVariant);

              return (
                <button
                  key={color}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    selectedColor === color
                      ? "border-ink bg-ink text-white"
                      : "border-black/10 bg-white text-ink"
                  } ${!isAvailable ? "cursor-not-allowed opacity-40" : "hover:border-black/30"}`}
                  disabled={!isAvailable}
                  onClick={() => setSelectedColor(color)}
                  type="button"
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Size</p>
        <div className="flex flex-wrap gap-3">
          {product.sizes.map((size) => {
            const sizeVariant = product.variants.find(
              (variant) => variant.size === size && variant.color === selectedColor,
            );
            const isAvailable = Boolean(sizeVariant && sizeVariant.inventory > 0);

            return (
              <button
                key={size}
                className={`min-w-14 rounded-full border px-4 py-2 text-sm font-medium ${
                  selectedSize === size ? "border-ink bg-ink text-white" : "border-black/10 bg-white text-ink"
                } ${!isAvailable ? "cursor-not-allowed opacity-40" : "hover:border-black/30"}`}
                disabled={!isAvailable}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Quantity</p>
        <div className="flex items-center gap-3">
          <button
            className="h-11 w-11 rounded-full border border-black/10 bg-white text-xl text-ink disabled:opacity-40"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            type="button"
          >
            -
          </button>
          <div className="flex h-11 min-w-16 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold">
            {quantity}
          </div>
          <button
            className="h-11 w-11 rounded-full border border-black/10 bg-white text-xl text-ink disabled:opacity-40"
            disabled={quantity >= matchingVariant.inventory}
            onClick={() => setQuantity((current) => Math.min(matchingVariant.inventory, current + 1))}
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          disabled={matchingVariant.inventory < 1}
          onClick={() => {
            addItem({
              productId: product.id,
              variantId: matchingVariant.id,
              title: product.title,
              slug: product.slug,
              imageUrl,
              price: matchingVariant.price,
              quantity,
              size: matchingVariant.size,
              color: matchingVariant.color,
              inventory: matchingVariant.inventory,
            });
            setStatus("Added to cart.");
          }}
        >
          {matchingVariant.inventory > 0 ? "Add to cart" : "Sold out"}
        </Button>
        {status ? <p className="text-sm text-moss">{status}</p> : null}
      </div>
    </div>
  );
}
