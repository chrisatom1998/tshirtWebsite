import Link from "next/link";

import { logoutAction } from "@/app/actions/admin-auth";
import { ButtonLink } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/", label: "Storefront" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="container-shell grid gap-8 py-8 lg:grid-cols-[260px,1fr]">
        <aside className="glass-panel h-fit space-y-6 p-6 lg:sticky lg:top-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Admin studio</p>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-ink">Threadline Control</h1>
          </div>
          <nav className="space-y-2 text-sm font-medium text-black/65">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-2xl px-4 py-3 hover:bg-white hover:text-ink">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="grid gap-3 pt-2">
            <ButtonLink href="/admin/products/new">New product</ButtonLink>
            <form action={logoutAction}>
              <button className="ring-focus w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-black hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <div className="space-y-8">{children}</div>
      </div>
    </div>
  );
}
