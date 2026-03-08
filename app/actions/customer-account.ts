"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getCustomerSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { wishlistToggleSchema, reviewSchema, supportTicketSchema } from "@/lib/validators";

export type WishlistActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  wishlisted: boolean;
};

export async function toggleWishlistAction(
  previousState: WishlistActionState,
  formData: FormData,
): Promise<WishlistActionState> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      ...previousState,
      status: "error",
      message: "Sign in to save products to your wishlist.",
    };
  }

  const parsed = wishlistToggleSchema.safeParse({
    productId: formData.get("productId"),
    pathname: formData.get("pathname"),
  });

  if (!parsed.success) {
    return {
      ...previousState,
      status: "error",
      message: "Unable to update wishlist.",
    };
  }

  const existing = await db.wishlistItem.findUnique({
    where: {
      customerId_productId: {
        customerId: session.userId,
        productId: parsed.data.productId,
      },
    },
  });

  if (existing) {
    await db.wishlistItem.delete({
      where: { id: existing.id },
    });
  } else {
    await db.wishlistItem.create({
      data: {
        customerId: session.userId,
        productId: parsed.data.productId,
      },
    });
  }

  const pathname = parsed.data.pathname || "/account";

  revalidatePath(pathname);
  revalidatePath("/products");
  revalidatePath("/account");

  return {
    status: "success",
    message: existing ? "Removed from wishlist." : "Saved to wishlist.",
    wishlisted: !existing,
  };
}

export async function saveReviewAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getCustomerSession();

  if (!session) {
    return {
      status: "error",
      message: "Sign in to leave a review.",
    };
  }

  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    title: formData.get("title"),
    body: formData.get("body"),
    pathname: formData.get("pathname"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the feedback fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const verifiedPurchase = Boolean(
    await db.orderItem.findFirst({
      where: {
        productId: parsed.data.productId,
        order: {
          OR: [{ customerId: session.userId }, { email: session.email }],
          status: {
            notIn: [OrderStatus.CANCELLED],
          },
        },
      },
      select: {
        id: true,
      },
    }),
  );

  await db.review.upsert({
    where: {
      customerId_productId: {
        customerId: session.userId,
        productId: parsed.data.productId,
      },
    },
    update: {
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      body: parsed.data.body.trim(),
      verifiedPurchase,
    },
    create: {
      customerId: session.userId,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      body: parsed.data.body.trim(),
      verifiedPurchase,
    },
  });

  const pathname = parsed.data.pathname || "/account";

  revalidatePath(pathname);
  revalidatePath("/products");
  revalidatePath("/account");

  return {
    status: "success",
    message: "Your review has been saved.",
  };
}

export async function submitSupportTicketAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getCustomerSession();
  const derivedEmail = session?.email || String(formData.get("email") || "");
  const derivedName = session?.name || String(formData.get("name") || "");

  const parsed = supportTicketSchema.safeParse({
    type: formData.get("type"),
    email: derivedEmail,
    name: derivedName,
    orderNumber: formData.get("orderNumber"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the support form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const order = parsed.data.orderNumber
    ? await db.order.findUnique({
        where: { orderNumber: parsed.data.orderNumber.trim() },
        select: {
          id: true,
          orderNumber: true,
          email: true,
          customerId: true,
        },
      })
    : null;

  if (parsed.data.orderNumber && !order) {
    return {
      status: "error",
      message: "We could not find that order number.",
      fieldErrors: {
        orderNumber: ["We could not find that order number."],
      },
    };
  }

  if (
    order &&
    order.email !== parsed.data.email &&
    (!session || order.customerId !== session.userId)
  ) {
    return {
      status: "error",
      message: "That order number does not match this account or email address.",
      fieldErrors: {
        orderNumber: ["That order number does not match this account or email address."],
      },
    };
  }

  await db.supportTicket.create({
    data: {
      customerId: session?.userId || null,
      orderId: order?.id || null,
      orderNumber: order?.orderNumber || parsed.data.orderNumber?.trim() || null,
      email: parsed.data.email,
      name: parsed.data.name?.trim() || session?.name || null,
      type: parsed.data.type,
      subject: parsed.data.subject.trim(),
      message: parsed.data.message.trim(),
    },
  });

  revalidatePath("/support");
  revalidatePath("/account");
  revalidatePath("/admin/support");

  return {
    status: "success",
    message: "Your request is in the queue. We’ll follow up by email.",
  };
}
