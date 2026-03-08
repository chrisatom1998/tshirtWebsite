import type { Metadata } from "next";

import { CatalogPagination } from "@/components/store/catalog-pagination";
import { ProductCard } from "@/components/store/product-card";
import { ProductFilters } from "@/components/store/product-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getStorefrontFilterOptions, getStorefrontProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse Threadline Supply t-shirts by size, color, or featured drops.",
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const search = firstValue(resolved.search);
  const size = firstValue(resolved.size);
  const color = firstValue(resolved.color);
  const featured = firstValue(resolved.featured);
  const sort = firstValue(resolved.sort) || "featured";
  const page = Number(firstValue(resolved.page) || "1");

  const [productPage, filterOptions] = await Promise.all([
    getStorefrontProducts({ search, size, color, featured, sort, page }),
    getStorefrontFilterOptions(),
  ]);

  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <SectionHeading
          eyebrow="Catalog"
          title="Browse the full t-shirt lineup"
          description="Filter by color, size, or featured releases. Cart contents persist locally, and checkout routes customers into Stripe for real payments."
        />
        <ProductFilters
          sizes={filterOptions.sizes}
          colors={filterOptions.colors}
          currentSearch={search}
          currentSize={size}
          currentColor={color}
          currentFeatured={featured}
          currentSort={sort}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-black/55">
          <p>
            {productPage.totalCount} product{productPage.totalCount === 1 ? "" : "s"} found
          </p>
          <p>Sorted by {sort.replace("-", " ")}</p>
        </div>
        {productPage.products.length === 0 ? (
          <EmptyState
            title="No products matched these filters"
            description="Try removing a filter, broadening your search terms, or reset back to the full collection."
            actionLabel="Reset filters"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {productPage.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <CatalogPagination
              page={productPage.page}
              totalPages={productPage.totalPages}
              searchParams={{
                search,
                size,
                color,
                featured,
                sort,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
