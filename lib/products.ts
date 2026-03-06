import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export const storefrontProductInclude = {
  images: {
    orderBy: {
      position: "asc" as const,
    },
  },
  variants: {
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" as const }, { size: "asc" as const }],
  },
} satisfies Prisma.ProductInclude;

export const adminProductInclude = {
  images: {
    orderBy: {
      position: "asc" as const,
    },
  },
  variants: {
    orderBy: [{ sortOrder: "asc" as const }, { size: "asc" as const }],
  },
} satisfies Prisma.ProductInclude;

export type StorefrontProduct = Prisma.ProductGetPayload<{
  include: typeof storefrontProductInclude;
}>;

export type AdminProduct = Prisma.ProductGetPayload<{
  include: typeof adminProductInclude;
}>;

export async function getFeaturedProducts(limit = 3) {
  return db.product.findMany({
    where: {
      isActive: true,
      featured: true,
    },
    include: storefrontProductInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getStorefrontProducts(filters: {
  search?: string;
  size?: string;
  color?: string;
  featured?: string;
}) {
  const { search, size, color, featured } = filters;

  return db.product.findMany({
    where: {
      isActive: true,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(size ? { sizes: { has: size } } : {}),
      ...(color ? { colors: { has: color } } : {}),
      ...(featured === "true" ? { featured: true } : {}),
    },
    include: storefrontProductInclude,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
}

export async function getStorefrontFilterOptions() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { sizes: true, colors: true },
  });

  return {
    sizes: [...new Set(products.flatMap((product) => product.sizes))],
    colors: [...new Set(products.flatMap((product) => product.colors))],
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: storefrontProductInclude,
  });
}

export async function getProductById(id: string) {
  return db.product.findUnique({
    where: { id },
    include: adminProductInclude,
  });
}

export async function getAdminProducts() {
  return db.product.findMany({
    include: adminProductInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminOrders(limit = 50) {
  return db.order.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminDashboardData() {
  const [productCount, orderCount, revenueAggregate, lowStockProducts, recentOrders] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.order.aggregate({ _sum: { total: true } }),
    db.product.findMany({
      where: {
        isActive: true,
        inventoryCount: {
          lte: 12,
        },
      },
      orderBy: { inventoryCount: "asc" },
      take: 5,
    }),
    db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    productCount,
    orderCount,
    revenue: revenueAggregate._sum.total ?? 0,
    lowStockProducts,
    recentOrders,
  };
}
