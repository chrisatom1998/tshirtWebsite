import { Prisma } from "@prisma/client";

import { PRODUCT_PAGE_SIZE } from "@/lib/constants";
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
  reviews: {
    select: {
      rating: true,
    },
  },
});

export const productDetailInclude = Prisma.validator<Prisma.ProductInclude>()({
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
  reviews: {
    include: {
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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
  reviews: {
    select: {
      rating: true,
    },
  },
});

export type StorefrontProduct = Prisma.ProductGetPayload<{
  include: typeof storefrontProductInclude;
}>;

export type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

export type AdminProduct = Prisma.ProductGetPayload<{
  include: typeof adminProductInclude;
}>;

export type AdminOrder = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

export type AdminCoupon = Prisma.CouponGetPayload<object>;

export type AdminSupportTicket = Prisma.SupportTicketGetPayload<{
  include: {
    order: {
      select: {
        orderNumber: true;
      };
    };
    customer: {
      select: {
        name: true;
        email: true;
      };
    };
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

export type StorefrontProductPage = {
  products: StorefrontProduct[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
};

function buildStorefrontWhere(filters: {
  search?: string;
  size?: string;
  color?: string;
  featured?: string;
}): Prisma.ProductWhereInput {
  const { search, size, color, featured } = filters;

  return {
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
  };
}

function buildStorefrontOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
      return [{ price: "asc" }, { createdAt: "desc" }];
    case "price-desc":
      return [{ price: "desc" }, { createdAt: "desc" }];
    case "title-asc":
      return [{ title: "asc" }];
    case "featured":
    default:
      return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

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
  sort?: string;
  page?: number;
  pageSize?: number;
}): Promise<StorefrontProductPage> {
  const where = buildStorefrontWhere(filters);
  const pageSize = filters.pageSize || PRODUCT_PAGE_SIZE;
  const totalCount = await db.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(filters.page || 1, 1), totalPages);

  const products = await db.product.findMany({
    where,
    include: storefrontProductInclude,
    orderBy: buildStorefrontOrderBy(filters.sort),
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  return {
    products,
    totalCount,
    totalPages,
    page,
    pageSize,
  };
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

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return db.product.findUnique({
    where: { slug },
    include: productDetailInclude,
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

export async function getAdminCoupons(): Promise<AdminCoupon[]> {
  return db.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function getAdminSupportTickets(limit = 50): Promise<AdminSupportTicket[]> {
  return db.supportTicket.findMany({
    include: {
      order: {
        select: {
          orderNumber: true,
        },
      },
      customer: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
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
