import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReviewForm } from "@/components/store/review-form";
import { ReviewStars } from "@/components/store/review-stars";
import { AddToCartForm } from "@/components/store/add-to-cart-form";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { WishlistButton } from "@/components/store/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/auth";
import { db } from "@/lib/db";
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
  const customerSession = await getCustomerSession();
  const product = await getProductBySlug(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const [relatedProducts, wishlistItem, currentReview] = await Promise.all([
    getFeaturedProducts(4),
    customerSession
      ? db.wishlistItem.findUnique({
          where: {
            customerId_productId: {
              customerId: customerSession.userId,
              productId: product.id,
            },
          },
        })
      : null,
    customerSession
      ? db.review.findUnique({
          where: {
            customerId_productId: {
              customerId: customerSession.userId,
              productId: product.id,
            },
          },
          select: {
            rating: true,
            title: true,
            body: true,
          },
        })
      : null,
  ]);

  const filteredRelatedProducts = relatedProducts.filter((entry) => entry.id !== product.id).slice(0, 3);
  const startingPrice = product.variants.reduce((lowest, variant) => Math.min(lowest, variant.price), product.price);
  const averageRating = product.reviews.length
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
    : 0;
  const productPath = `/products/${product.slug}`;

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
                <div className="flex flex-wrap items-center gap-4">
                  <p className="text-xl font-semibold text-ink">From {formatCurrency(startingPrice)}</p>
                  <div className="flex items-center gap-2 text-sm text-black/60">
                    <ReviewStars rating={Math.round(averageRating)} />
                    <span>
                      {product.reviews.length ? `${averageRating.toFixed(1)} (${product.reviews.length} reviews)` : "No reviews yet"}
                    </span>
                  </div>
                </div>
                <p className="max-w-2xl text-base leading-8 text-black/70">{product.description}</p>
              </div>
            </div>
            <div className="grid gap-4 text-sm text-black/65 sm:grid-cols-3">
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Sizes</p>
                <p className="mt-2">{product.sizes.join(" / ")}</p>
              </div>
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Colors</p>
                <p className="mt-2">{product.colors.join(" / ")}</p>
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
            {customerSession ? (
              <WishlistButton productId={product.id} pathname={productPath} initialWishlisted={Boolean(wishlistItem)} />
            ) : (
              <ButtonLink href={`/account/login?next=${encodeURIComponent(productPath)}`} variant="ghost">
                Sign in to save this product
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
          {customerSession ? (
            <ReviewForm productId={product.id} pathname={productPath} initialReview={currentReview} />
          ) : (
            <div className="glass-panel space-y-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Customer feedback</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Have you worn it?</h2>
              <p className="text-base leading-8 text-black/70">
                Sign in to leave a review, save this product to your wishlist, and keep your order support history in one place.
              </p>
              <ButtonLink href={`/account/login?next=${encodeURIComponent(productPath)}`}>Sign in to review</ButtonLink>
            </div>
          )}

          <div className="glass-panel space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Reviews</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">What customers are saying</h2>
            </div>
            {product.reviews.length === 0 ? (
              <p className="text-sm leading-7 text-black/65">No reviews yet. The first customer review will appear here.</p>
            ) : (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{review.customer.name || review.customer.email}</p>
                        <p className="text-sm text-black/55">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <ReviewStars rating={review.rating} className="justify-end" />
                        {review.verifiedPurchase ? (
                          <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-moss">
                            Verified purchase
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {review.title ? <p className="mt-3 font-semibold text-ink">{review.title}</p> : null}
                    <p className="mt-2 text-sm leading-7 text-black/65">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredRelatedProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Related picks</p>
              <h2 className="font-[family-name:var(--font-heading)] text-4xl font-semibold text-ink">Keep the rotation going</h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {filteredRelatedProducts.map((entry) => (
                <ProductCard key={entry.id} product={entry} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
