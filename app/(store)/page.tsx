import { ProductCard } from "@/components/store/product-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { BRAND_TAGLINE } from "@/lib/constants";
import { getFeaturedProducts } from "@/lib/products";

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(3);

  return (
    <div>
      <section className="section-space">
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-8">
            <Badge>New season</Badge>
            <div className="space-y-6">
              <h1 className="max-w-4xl font-[family-name:var(--font-heading)] text-5xl font-semibold leading-[0.95] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Built for daily wear.
                <span className="block text-clay">Printed like a statement piece.</span>
              </h1>
              <p className="max-w-2xl text-lg leading-9 text-black/70">{BRAND_TAGLINE}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <ButtonLink href="/products" size="lg">
                Shop the collection
              </ButtonLink>
              <ButtonLink href="/admin/login" variant="ghost" size="lg">
                Open admin
              </ButtonLink>
            </div>
            <div className="grid gap-4 text-sm text-black/60 sm:grid-cols-3">
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Premium blanks</p>
                <p className="mt-2 leading-7">Heavy cotton, relaxed cuts, built to hold shape through repeat wear.</p>
              </div>
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Fast checkout</p>
                <p className="mt-2 leading-7">Stripe Checkout handles card payments, taxes, and shipping capture securely.</p>
              </div>
              <div className="glass-panel p-4">
                <p className="font-semibold uppercase tracking-[0.2em] text-black/45">Variant ready</p>
                <p className="mt-2 leading-7">Sizes, colors, inventory, and orders are managed directly in the admin studio.</p>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-clay/20 blur-3xl" />
            <div className="absolute -right-6 bottom-12 h-44 w-44 rounded-full bg-ocean/20 blur-3xl" />
            <div className="glass-panel relative overflow-hidden p-4">
              <div className="rounded-[2rem] bg-mesh-radial p-6">
                <img
                  src={featuredProducts[0]?.images[0]?.url || "/products/after-hours-front.svg"}
                  alt={featuredProducts[0]?.title || "Featured t-shirt"}
                  className="mx-auto aspect-[4/5] w-full max-w-md rounded-[1.75rem] border border-black/10 bg-white object-cover shadow-panel"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-space pt-4">
        <div className="container-shell space-y-10">
          <SectionHeading
            eyebrow="Featured products"
            title="The current Threadline rotation"
            description="A focused catalog built for fast browsing, fast checkout, and easy product management once the orders start rolling in."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
