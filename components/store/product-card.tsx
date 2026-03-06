import Link from "next/link";

import type { StorefrontProduct } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  const image = product.images[0]?.url || "/products/placeholder.svg";
  const minVariantPrice = product.variants.reduce(
    (lowest, variant) => Math.min(lowest, variant.price),
    product.price,
  );

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group glass-panel flex h-full flex-col overflow-hidden border-transparent hover:-translate-y-1 hover:border-black/10"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-white/80">
        <img
          src={image}
          alt={product.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {product.featured ? (
          <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            Featured
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-2">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink">{product.title}</h3>
          <p className="line-clamp-2 text-sm leading-7 text-black/65">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-sm uppercase tracking-[0.2em] text-black/45">
            {product.colors.slice(0, 2).join(" · ") || "Core colors"}
          </p>
          <p className="text-lg font-semibold text-ink">{formatCurrency(minVariantPrice)}</p>
        </div>
      </div>
    </Link>
  );
}
