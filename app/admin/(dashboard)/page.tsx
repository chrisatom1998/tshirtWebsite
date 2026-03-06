import { OrderStatusPill } from "@/components/admin/order-status-pill";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminDashboardData } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Overview</p>
          <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Store performance at a glance</h2>
        </div>
        <ButtonLink href="/admin/products/new">Add a new tee</ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Products</p>
          <p className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">{data.productCount}</p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Orders</p>
          <p className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">{data.orderCount}</p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Revenue</p>
          <p className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">{formatCurrency(data.revenue)}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <section className="glass-panel space-y-5 p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Low stock</p>
            <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Products to replenish soon</h3>
          </div>
          {data.lowStockProducts.length === 0 ? (
            <EmptyState
              title="No low-stock alerts"
              description="Inventory levels are healthy across the active catalog right now."
            />
          ) : (
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{product.title}</p>
                      <p className="text-sm text-black/60">/{product.slug}</p>
                    </div>
                    <p className="text-lg font-semibold text-clay">{product.inventoryCount} left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="glass-panel space-y-5 p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Recent orders</p>
            <h3 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Fresh payments</h3>
          </div>
          {data.recentOrders.length === 0 ? (
            <EmptyState
              title="No orders yet"
              description="Once Stripe checkout completes and the webhook lands, paid orders will appear here."
            />
          ) : (
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div key={order.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{order.orderNumber}</p>
                      <p className="text-sm text-black/60">{order.email}</p>
                    </div>
                    <OrderStatusPill status={order.status} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-black/60">
                    <span>{order.items.length} items</span>
                    <span className="font-semibold text-ink">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
