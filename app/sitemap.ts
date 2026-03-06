import type { MetadataRoute } from "next";
import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

type SitemapProduct = Prisma.ProductGetPayload<{
  select: {
    slug: true;
    updatedAt: true;
  };
}>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const products: SitemapProduct[] = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
    },
    ...products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
