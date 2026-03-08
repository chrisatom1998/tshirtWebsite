import { CouponType } from "@prisma/client";

import { AdminCouponForm } from "@/components/admin/admin-coupon-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminCoupons } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

function formatCouponAmount(type: CouponType, amount: number) {
  return type === CouponType.PERCENTAGE ? `${amount}% off` : `${formatCurrency(amount)} off`;
}

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Coupons</p>
        <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Custom discount control</h2>
      </div>

      <section className="glass-panel space-y-5 p-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Create coupon</p>
          <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Add a new offer</h3>
        </div>
        <AdminCouponForm />
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Existing coupons</p>
          <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Manage active and archived codes</h3>
        </div>
        {coupons.length === 0 ? (
          <EmptyState
            title="No custom coupons yet"
            description="Create your first code to offer fixed or percentage discounts outside Stripe promotion codes."
          />
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="glass-panel space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">{coupon.code}</p>
                    <p className="text-sm text-black/60">{coupon.title}</p>
                  </div>
                  <div className="space-y-1 text-right text-sm text-black/60">
                    <p className="font-semibold text-ink">{formatCouponAmount(coupon.type, coupon.amount)}</p>
                    <p>{coupon.isActive ? "Active" : "Inactive"}</p>
                    <p>
                      Used {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm text-black/60 md:grid-cols-3">
                  <p>Minimum subtotal: {coupon.minimumSubtotal ? formatCurrency(coupon.minimumSubtotal) : "None"}</p>
                  <p>Starts: {coupon.startsAt ? new Date(coupon.startsAt).toLocaleString() : "Immediately"}</p>
                  <p>Ends: {coupon.endsAt ? new Date(coupon.endsAt).toLocaleString() : "No end date"}</p>
                </div>
                <AdminCouponForm
                  initialValues={{
                    id: coupon.id,
                    code: coupon.code,
                    title: coupon.title,
                    description: coupon.description,
                    type: coupon.type,
                    amount: coupon.amount,
                    minimumSubtotal: coupon.minimumSubtotal,
                    usageLimit: coupon.usageLimit,
                    startsAt: coupon.startsAt,
                    endsAt: coupon.endsAt,
                    isActive: coupon.isActive,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
