import { Role } from "@prisma/client";

import { db } from "@/lib/db";

export async function getCustomerByEmail(email: string) {
  return db.user.findFirst({
    where: {
      email,
      role: Role.CUSTOMER,
    },
  });
}

export async function getCustomerAccountData(customerId: string, email: string) {
  const [customer, orders, tickets] = await Promise.all([
    db.user.findUnique({
      where: { id: customerId },
      include: {
        wishlistItems: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: "asc" },
                },
                variants: {
                  where: { isActive: true },
                  orderBy: [{ sortOrder: "asc" }, { size: "asc" }],
                },
                reviews: {
                  select: {
                    rating: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        reviews: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { position: "asc" },
                },
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 8,
        },
      },
    }),
    db.order.findMany({
      where: {
        OR: [{ customerId }, { email }],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.supportTicket.findMany({
      where: {
        OR: [{ customerId }, { email }],
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    customer,
    orders,
    tickets,
  };
}
