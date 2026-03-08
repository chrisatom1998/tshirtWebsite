import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { customerLogoutAction } from "@/app/actions/customer-auth";
import { OrderStatusPill } from "@/components/admin/order-status-pill";
import { ReviewStars } from "@/components/store/review-stars";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomerAccountData } from "@/lib/account";
import { requireCustomer } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Your Account",
  description: "Manage saved products, reviews, order history, and support requests.",
};

export default async function AccountPage() {
  const session = await requireCustomer("/account");
  const data = await getCustomerAccountData(session.userId, session.email);

  if (!data.customer) {
    redirect("/account/login");
  }

  const openTickets = data.tickets.filter((ticket) => !["RESOLVED", "CLOSED"].includes(ticket.status)).length;

  return (
    <section className="section-space">
      <div className="container-shell space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Customer account</p>
            <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">
              {data.customer.name || data.customer.email}
            </h1>
            <p className="text-base text-black/65">{data.customer.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/support" variant="ghost">
              Returns and support
            </ButtonLink>
            <form action={customerLogoutAction}>
              <button className="ring-focus rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-black hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Wishlist</p>
            <p className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">
              {data.customer.wishlistItems.length}
            </p>
          </div>
          <div className="glass-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Orders</p>
            <p className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">{data.orders.length}</p>
          </div>
          <div className="glass-panel p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Open tickets</p>
            <p className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">{openTickets}</p>
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
          <section className="glass-panel space-y-5 p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Recent orders</p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Your purchases</h2>
              </div>
              <ButtonLink href="/products" variant="ghost">
                Shop again
              </ButtonLink>
            </div>
            {data.orders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Once you check out, paid orders and fulfillment updates will show up here."
                actionLabel="Browse products"
                actionHref="/products"
              />
            ) : (
              <div className="space-y-4">
                {data.orders.map((order) => (
                  <div key={order.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{order.orderNumber}</p>
                        <p className="text-sm text-black/55">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <OrderStatusPill status={order.status} />
                        <p className="text-sm font-semibold text-ink">{formatCurrency(order.total)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-black/60">
                      <span>{order.items.length} line items</span>
                      {order.couponCode ? <span>Coupon {order.couponCode}</span> : null}
                      {order.trackingNumber ? <span>Tracking {order.trackingNumber}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="glass-panel space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Support</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Open conversations</h2>
            </div>
            {data.tickets.length === 0 ? (
              <EmptyState
                title="No support tickets yet"
                description="Need help with sizing, shipping, or returns? Start a support request and it will land here."
                actionLabel="Start a request"
                actionHref="/support"
              />
            ) : (
              <div className="space-y-4">
                {data.tickets.map((ticket) => (
                  <div key={ticket.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink">{ticket.subject}</p>
                        <p className="text-sm text-black/55">
                          {ticket.type} {ticket.orderNumber ? `· ${ticket.orderNumber}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                        {ticket.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-black/65">{ticket.message}</p>
                    {ticket.adminResponse ? (
                      <div className="mt-4 rounded-[1.25rem] border border-black/10 bg-canvas/80 p-3 text-sm text-black/65">
                        <p className="font-semibold text-ink">Latest response</p>
                        <p className="mt-2">{ticket.adminResponse}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="glass-panel space-y-5 p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Wishlist</p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Saved products</h2>
              </div>
              <ButtonLink href="/products" variant="ghost">
                Explore catalog
              </ButtonLink>
            </div>
            {data.customer.wishlistItems.length === 0 ? (
              <EmptyState
                title="No saved products yet"
                description="Use the wishlist button on any product page to save it here for later."
                actionLabel="Browse products"
                actionHref="/products"
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.customer.wishlistItems.map((entry) => (
                  <Link key={entry.id} href={`/products/${entry.product.slug}`} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4 hover:border-black/20">
                    <div className="flex gap-4">
                      <img
                        src={entry.product.images[0]?.url || "/products/placeholder.svg"}
                        alt={entry.product.title}
                        className="h-24 w-20 rounded-[1rem] border border-black/10 bg-white object-cover"
                      />
                      <div className="space-y-2">
                        <p className="font-semibold text-ink">{entry.product.title}</p>
                        <p className="text-sm text-black/60">{entry.product.colors.slice(0, 2).join(" / ")}</p>
                        <ReviewStars
                          rating={
                            entry.product.reviews.length
                              ? Math.round(
                                  entry.product.reviews.reduce((sum, review) => sum + review.rating, 0) /
                                    entry.product.reviews.length,
                                )
                              : 0
                          }
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="glass-panel space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Reviews</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Your feedback</h2>
            </div>
            {data.customer.reviews.length === 0 ? (
              <EmptyState
                title="No reviews submitted yet"
                description="Once you leave product feedback, it will be easy to revisit and update it here."
              />
            ) : (
              <div className="space-y-4">
                {data.customer.reviews.map((review) => (
                  <div key={review.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/products/${review.product.slug}`} className="font-semibold text-ink hover:text-clay">
                          {review.product.title}
                        </Link>
                        <p className="mt-1 text-sm text-black/55">{new Date(review.updatedAt).toLocaleDateString()}</p>
                      </div>
                      <ReviewStars rating={review.rating} />
                    </div>
                    {review.title ? <p className="mt-3 font-semibold text-ink">{review.title}</p> : null}
                    <p className="mt-2 text-sm leading-7 text-black/65">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
