import { AdminOrderUpdateForm } from "@/components/admin/admin-order-update-form";
import { OrderStatusPill } from "@/components/admin/order-status-pill";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminOrders } from "@/lib/products";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Orders</p>
        <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Fulfillment and status control</h2>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders recorded yet"
          description="Orders appear here after Stripe sends a successful checkout event to your webhook endpoint."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="glass-panel space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">{order.orderNumber}</p>
                  <p className="text-sm text-black/60">{order.email}</p>
                </div>
                <div className="space-y-2 text-right">
                  <OrderStatusPill status={order.status} />
                  <p className="text-sm font-semibold text-ink">{formatCurrency(order.total)}</p>
                </div>
              </div>

              <div className="grid gap-4 text-sm text-black/65 md:grid-cols-4">
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Created</p>
                  <p className="mt-2">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Discount</p>
                  <p className="mt-2">
                    {order.discountAmount > 0 ? `${order.couponCode || "Coupon"} · -${formatCurrency(order.discountAmount)}` : "None"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Shipping</p>
                  <p className="mt-2">{formatCurrency(order.shippingAmount)}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Tax</p>
                  <p className="mt-2">{formatCurrency(order.taxAmount)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-black/10 bg-white/70 p-4 text-sm text-black/65"
                  >
                    <div>
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p>
                        {[item.size, item.color, `Qty ${item.quantity}`].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                    <p className="font-semibold text-ink">{formatCurrency(item.totalAmount)}</p>
                  </div>
                ))}
              </div>

              <AdminOrderUpdateForm
                orderId={order.id}
                status={order.status}
                shippingCarrier={order.shippingCarrier}
                trackingNumber={order.trackingNumber}
                fulfillmentNotes={order.fulfillmentNotes}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
