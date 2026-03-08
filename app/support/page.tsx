import type { Metadata } from "next";

import { SupportTicketForm } from "@/components/support/support-ticket-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getCustomerSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Returns and Support",
  description: "Submit a return or support request and track the response with Threadline Supply.",
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getCustomerSession();
  const resolved = await searchParams;
  const orderNumber = firstValue(resolved.order);
  const recentTickets = session
    ? await db.supportTicket.findMany({
        where: {
          OR: [{ customerId: session.userId }, { email: session.email }],
        },
        orderBy: { createdAt: "desc" },
        take: 4,
      })
    : [];

  return (
    <section className="section-space">
      <div className="container-shell grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="space-y-8">
          <div className="glass-panel space-y-4 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Returns and support</p>
            <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Talk to the Threadline team</h1>
            <p className="max-w-xl text-base leading-8 text-black/70">
              Use this form for return requests, exchange questions, shipping issues, or general product support. Every request creates a real ticket that appears in the admin inbox and, if you have an account, in your customer dashboard.
            </p>
          </div>
          <div className="glass-panel space-y-4 p-8">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">What to include</h2>
            <div className="space-y-3 text-sm leading-7 text-black/65">
              <p>Order number if the request is tied to a purchase.</p>
              <p>The exact item, size, or color that needs attention.</p>
              <p>The outcome you want: refund, exchange, shipment update, or something else.</p>
            </div>
          </div>
          {session ? (
            <div className="glass-panel space-y-5 p-8">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Recent requests</p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Your latest tickets</h2>
              </div>
              {recentTickets.length === 0 ? (
                <EmptyState
                  title="No support tickets yet"
                  description="Your recent support requests will appear here after you submit them."
                />
              ) : (
                <div className="space-y-3">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-[1.5rem] border border-black/10 bg-white/70 p-4">
                      <div className="flex items-start justify-between gap-3">
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
                      {ticket.adminResponse ? <p className="mt-3 text-sm leading-7 text-black/65">{ticket.adminResponse}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        <div>
          <SupportTicketForm defaultEmail={session?.email} defaultName={session?.name} defaultOrderNumber={orderNumber} />
        </div>
      </div>
    </section>
  );
}
