import { AdminSupportTicketForm } from "@/components/admin/admin-support-ticket-form";
import { EmptyState } from "@/components/ui/empty-state";
import { getAdminSupportTickets } from "@/lib/products";

export default async function AdminSupportPage() {
  const tickets = await getAdminSupportTickets();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Support</p>
        <h2 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Returns and support inbox</h2>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No support tickets yet"
          description="Customer return and support requests will land here once the new form is used."
        />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="glass-panel space-y-5 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">{ticket.subject}</p>
                  <p className="text-sm text-black/60">
                    {ticket.name || ticket.customer?.name || ticket.email} · {ticket.email}
                  </p>
                </div>
                <div className="space-y-1 text-right text-sm text-black/60">
                  <p className="font-semibold text-ink">{ticket.type}</p>
                  <p>{ticket.status}</p>
                  <p>{new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid gap-4 text-sm text-black/65 md:grid-cols-2">
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Order</p>
                  <p className="mt-2">{ticket.order?.orderNumber || ticket.orderNumber || "Not attached to an order"}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Latest customer message</p>
                  <p className="mt-2">{ticket.message}</p>
                </div>
              </div>

              <AdminSupportTicketForm ticketId={ticket.id} status={ticket.status} adminResponse={ticket.adminResponse} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
