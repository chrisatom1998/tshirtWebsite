import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CustomerRegisterForm } from "@/components/account/customer-register-form";
import { getCustomerSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a customer account for wishlists, reviews, orders, and support requests.",
};

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AccountRegisterPage({
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
      <div className="container-shell grid gap-8 lg:grid-cols-[1fr,1fr]">
        <div className="glass-panel space-y-4 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Customer account</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Create your Threadline account</h1>
          <p className="max-w-xl text-base leading-8 text-black/70">
            Accounts are optional for checkout, but they unlock wishlists, reviews, order tracking context, and a persistent support history.
          </p>
          <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5 text-sm text-black/65">
            Already set up?{" "}
            <Link href={`/account/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-ink hover:text-clay">
              Sign in instead
            </Link>
          </div>
        </div>
        <div className="glass-panel p-8">
          <CustomerRegisterForm nextPath={nextPath} />
        </div>
      </div>
    </section>
  );
}
