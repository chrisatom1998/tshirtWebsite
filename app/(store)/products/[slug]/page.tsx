import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/components/store/add-to-cart-form";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { Badge } from "@/components/ui/badge";
import { getFeaturedProducts, getProductBySlug } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedProducts = (await getFeaturedProducts(4)).filter((entry) => entry.id !== product.id).slice(0, 3);
  const startingPrice = product.variants.reduce((lowest, variant) => Math.min(lowest, variant.price), product.price);

  return (
    <section className="section-space">
      <div className="container-shell space-y-16">
        <div className="grid gap-10 lg:grid-cols-[1fr,0.85fr]">
          <ProductGallery images={product.images} title={product.title} />
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge>{product.featured ? "Featured drop" : "Core catalog"}</Badge>
              <div className="space-y-4">
                <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold tracking-tight text-ink">
                  {product.title}
                </h1>
                <p className="text-xl font-semibold text-ink">From {formatCurrency(startingPrice)}</p>
                <p className="max-w-2xl text-base leading-8 text-black/70">{product.description}</p>
              </div>
            </div>
            <div className="grid gap-4 text-sm text-black/65 sm:grid-cols-3">
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Sizes</p>
                <p className="mt-2">{product.sizes.join(" Â· ")}</p>
              </div>
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Colors</p>
                <p className="mt-2">{product.colors.join(" Â· ")}</p>
              </div>
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Inventory</p>
                <p className="mt-2">{product.inventoryCount} units across variants</p>
              </div>
            </div>
            <AddToCartForm
              product={{
                id: product.id,
                title: product.title,
                slug: product.slug,
                images: product.images,
                variants: product.variants.map((variant) => ({
                  id: variant.id,
                  size: variant.size,
                  color: variant.color,
                  price: variant.price,
                  inventory: variant.inventory,
                })),
                sizes: product.sizes,
                colors: product.colors,
              }}
            />
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Related picks</p>
              <h2 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-ink">Keep the rotation going</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {relatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
