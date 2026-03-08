import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800",
  PROCESSING: "bg-sky-100 text-sky-800",
  FULFILLED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-moss/15 text-moss",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-amber-100 text-amber-800",
};

export function OrderStatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
        statusStyles[status] || "bg-black/5 text-black/60",
      )}
    >
      {status}
    </span>
  );
}
