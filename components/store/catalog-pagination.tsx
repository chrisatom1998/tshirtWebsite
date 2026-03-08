import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function buildHref(searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function CatalogPagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-black/55">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={buildHref(searchParams, Math.max(page - 1, 1))}
          className={cn(buttonStyles({ variant: "ghost", size: "sm" }), page <= 1 && "pointer-events-none opacity-40")}
          aria-disabled={page <= 1}
        >
          Previous
        </Link>
        {Array.from({ length: totalPages }, (_, index) => index + 1)
          .filter((value) => Math.abs(value - page) <= 1 || value === 1 || value === totalPages)
          .map((value, index, values) => (
            <span key={value} className="flex items-center gap-2">
              {index > 0 && values[index - 1] !== value - 1 ? <span className="px-2 text-black/35">...</span> : null}
              <Link
                href={buildHref(searchParams, value)}
                className={buttonStyles({ variant: value === page ? "secondary" : "ghost", size: "sm" })}
              >
                {value}
              </Link>
            </span>
          ))}
        <Link
          href={buildHref(searchParams, Math.min(page + 1, totalPages))}
          className={cn(
            buttonStyles({ variant: "ghost", size: "sm" }),
            page >= totalPages && "pointer-events-none opacity-40",
          )}
          aria-disabled={page >= totalPages}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
