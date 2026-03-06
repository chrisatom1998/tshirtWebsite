import Link from "next/link";

import { CartButton } from "@/components/store/cart-button";
import { ButtonLink } from "@/components/ui/button";
import { BRAND_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-canvas/85 backdrop-blur-xl">
      <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="group flex items-end gap-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-black/45">Studio line</p>
            <p className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-ink transition group-hover:text-clay">
              {BRAND_NAME}
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium text-black/65 md:gap-6">
          <Link className="hover:text-ink" href="/">
            Home
          </Link>
          <Link className="hover:text-ink" href="/products">
            Shop
          </Link>
          <Link className="hover:text-ink" href="/cart">
            Cart
          </Link>
          <Link className="hover:text-ink" href="/admin/login">
            Admin
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonLink href="/products" variant="ghost" className="hidden sm:inline-flex">
            Shop the drop
          </ButtonLink>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
