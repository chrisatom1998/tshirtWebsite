import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { getCustomerSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Customer Sign In",
  description: "Sign in to manage your wishlist, reviews, orders, and support requests.",
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getCustomerSession();

  if (session) {
    redirect("/account");
  }

  const resolved = await searchParams;
  const nextPath = firstValue(resolved.next) || "/account";

  return (
    <section className="section-space">
      <div className="container-shell grid gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="glass-panel space-y-4 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Customer account</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Sign in to your account</h1>
          <p className="max-w-xl text-base leading-8 text-black/70">
            Saved wishlists, product reviews, recent orders, and support updates all live in one place once you sign in.
          </p>
          <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5 text-sm text-black/65">
            New here?{" "}
            <Link href={`/account/register?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-ink hover:text-clay">
              Create an account
            </Link>
          </div>
        </div>
        <div className="glass-panel p-8">
          <CustomerLoginForm nextPath={nextPath} />
        </div>
      </div>
    </section>
  );
}
