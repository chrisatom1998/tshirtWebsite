import Link from "next/link";

import { BRAND_DESCRIPTION, BRAND_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/70">
      <div className="container-shell grid gap-10 py-12 md:grid-cols-[1.5fr,1fr,1fr]">
        <div className="space-y-4">
          <p className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink">{BRAND_NAME}</p>
          <p className="max-w-md text-sm leading-7 text-black/65">{BRAND_DESCRIPTION}</p>
        </div>
        <div className="space-y-3 text-sm text-black/65">
          <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Shop</p>
          <div className="space-y-2">
            <Link className="block hover:text-ink" href="/products">
              All products
            </Link>
            <Link className="block hover:text-ink" href="/cart">
              Cart
            </Link>
            <Link className="block hover:text-ink" href="/support">
              Returns and support
            </Link>
          </div>
        </div>
        <div className="space-y-3 text-sm text-black/65">
          <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Account</p>
          <div className="space-y-2">
            <Link className="block hover:text-ink" href="/account/login">
              Sign in
            </Link>
            <Link className="block hover:text-ink" href="/account">
              Dashboard
            </Link>
            <Link className="block hover:text-ink" href="/admin/login">
              Admin studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
