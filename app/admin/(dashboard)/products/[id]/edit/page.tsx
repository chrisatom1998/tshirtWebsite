import { notFound } from "next/navigation";

import { AdminProductForm } from "@/components/admin/admin-product-form";
import { getProductById } from "@/lib/products";
import { formatPriceInput } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Edit product</p>
        <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">{product.title}</h2>
      </div>
      <AdminProductForm
        initialValues={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: formatPriceInput(product.price),
          featured: product.featured,
          isActive: product.isActive,
          images: product.images.map((image) => ({
            url: image.url,
            alt: image.alt,
          })),
          variants: product.variants.map((variant) => ({
            size: variant.size,
            color: variant.color,
            price: Number(formatPriceInput(variant.price)),
            inventory: variant.inventory,
            sku: variant.sku || "",
          })),
        }}
      />
    </div>
  );
}
