import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export const storefrontProductInclude = Prisma.validator<Prisma.ProductInclude>()({
  images: {
    orderBy: {
      position: "asc",
    },
  },
  variants: {
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { size: "asc" }],
  },
});

export const adminProductInclude = Prisma.validator<Prisma.ProductInclude>()({
  images: {
    orderBy: {
      position: "asc",
    },
  },
  variants: {
    orderBy: [{ sortOrder: "asc" }, { size: "asc" }],
  },
});

export type StorefrontProduct = Prisma.ProductGetPayload<{
  include: typeof storefrontProductInclude;
}>;

export type AdminProduct = Prisma.ProductGetPayload<{
  include: typeof adminProductInclude;
}>;

export type AdminOrder = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

export type DashboardLowStockProduct = Prisma.ProductGetPayload<{
  select: {
    id: true;
    title: true;
    slug: true;
    inventoryCount: true;
  };
}>;

type StorefrontFilterRecord = Prisma.ProductGetPayload<{
  select: {
    sizes: true;
    colors: true;
  };
}>;

export type AdminDashboardData = {
  productCount: number;
  orderCount: number;
  revenue: number;
  lowStockProducts: DashboardLowStockProduct[];
  recentOrders: AdminOrder[];
};

export async function getFeaturedProducts(limit = 3): Promise<StorefrontProduct[]> {
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
}): Promise<StorefrontProduct[]> {
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

export async function getStorefrontFilterOptions(): Promise<{ sizes: string[]; colors: string[] }> {
  const products: StorefrontFilterRecord[] = await db.product.findMany({
    where: { isActive: true },
    select: { sizes: true, colors: true },
  });

  return {
    sizes: [...new Set(products.flatMap((product) => product.sizes))],
    colors: [...new Set(products.flatMap((product) => product.colors))],
  };
}

export async function getProductBySlug(slug: string): Promise<StorefrontProduct | null> {
  return db.product.findUnique({
    where: { slug },
    include: storefrontProductInclude,
  });
}

export async function getProductById(id: string): Promise<AdminProduct | null> {
  return db.product.findUnique({
    where: { id },
    include: adminProductInclude,
  });
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return db.product.findMany({
    include: adminProductInclude,
    orderBy: { updatedAt: "desc" },
  });
}

export async function getAdminOrders(limit = 50): Promise<AdminOrder[]> {
  return db.order.findMany({
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
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
      select: {
        id: true,
        title: true,
        slug: true,
        inventoryCount: true,
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
