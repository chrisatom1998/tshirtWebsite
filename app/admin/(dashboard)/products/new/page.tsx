import { AdminProductForm } from "@/components/admin/admin-product-form";

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">New product</p>
        <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Create a new tee</h2>
      </div>
      <AdminProductForm />
    </div>
  );
}
