import { deleteProductAction } from "@/app/actions/admin-products";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminProducts } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Products</p>
          <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Catalog management</h2>
        </div>
        <ButtonLink href="/admin/products/new">Create product</ButtonLink>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first t-shirt product, add variants, then publish it to the storefront."
          actionLabel="Create product"
          actionHref="/admin/products/new"
        />
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="glass-panel flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex gap-4">
                <img
                  src={product.images[0]?.url || "/products/placeholder.svg"}
                  alt={product.title}
                  className="h-28 w-24 rounded-[1.5rem] border border-black/10 bg-white object-cover"
                />
                <div className="space-y-3">
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">{product.title}</p>
                    <p className="text-sm text-black/55">/{product.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-black/65">
                    <span>{formatCurrency(product.price)}</span>
                    <span>{product.variants.length} variants</span>
                    <span>{product.inventoryCount} in stock</span>
                    <span>{product.featured ? "Featured" : "Standard"}</span>
                    <span>{product.isActive ? "Visible" : "Hidden"}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href={`/products/${product.slug}`} variant="ghost">
                  View live
                </ButtonLink>
                <ButtonLink href={`/admin/products/${product.id}/edit`}>
                  Edit
                </ButtonLink>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="slug" value={product.slug} />
                  <button className="ring-focus rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
