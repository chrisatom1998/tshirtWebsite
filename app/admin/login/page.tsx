import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  return (
    <section className="section-space">
      <div className="container-shell grid gap-10 lg:grid-cols-[1fr,0.8fr]">
        <div className="space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Admin access</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl font-semibold text-ink">Manage the catalog, inventory, and paid orders.</h1>
          <p className="max-w-2xl text-base leading-8 text-black/70">
            This login uses a secure HTTP-only session cookie. Seeded admin credentials come from your environment variables so you can change them before deployment.
          </p>
        </div>
        <div className="glass-panel p-8 sm:p-10">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black/45">Sign in</p>
              <h2 className="mt-2 font-[family-name:var(--font-heading)] text-4xl font-semibold text-ink">Threadline Control</h2>
            </div>
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </section>
  );
}
