import { CouponType, OrderStatus, SupportTicketStatus, SupportTicketType } from "@prisma/client";
import { z } from "zod";

import { SHIRT_SIZES } from "@/lib/constants";

const localOrRemoteUrlSchema = z
  .string()
  .min(1)
  .refine((value) => value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"), {
    message: "Use a valid image URL or a local /public asset path.",
  });

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long."),
});

export const productImageSchema = z.object({
  url: localOrRemoteUrlSchema,
  alt: z.string().max(160).optional(),
});

export const productVariantSchema = z.object({
  size: z.enum(SHIRT_SIZES),
  color: z.string().trim().max(40).default(""),
  price: z.coerce.number().positive("Variant price must be greater than zero."),
  inventory: z.coerce.number().int().min(0, "Inventory cannot be negative."),
  sku: z.string().trim().max(80).optional(),
});

export const productFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3, "Title must be at least 3 characters."),
  slug: z.string().trim().min(3, "Slug must be at least 3 characters."),
  description: z.string().trim().min(30, "Description must be at least 30 characters."),
  price: z.coerce.number().positive("Base price must be greater than zero."),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(productImageSchema).min(1, "Add at least one product image."),
  variants: z.array(productVariantSchema).min(1, "Add at least one product variant."),
});

export const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        variantId: z.string().cuid("Invalid variant."),
        quantity: z.coerce.number().int().min(1).max(10),
      }),
    )
    .min(1, "Your cart is empty."),
  couponCode: z.string().trim().max(40).optional(),
});

export const reviewSchema = z.object({
  productId: z.string().cuid("Invalid product."),
  rating: z.coerce.number().int().min(1, "Choose a rating from 1 to 5.").max(5, "Choose a rating from 1 to 5."),
  title: z.string().trim().max(120, "Title is too long.").optional(),
  body: z.string().trim().min(20, "Review must be at least 20 characters.").max(1000, "Review is too long."),
  pathname: z.string().trim().min(1).optional(),
});

export const supportTicketSchema = z.object({
  type: z.nativeEnum(SupportTicketType),
  email: z.string().email("Enter a valid email address."),
  name: z.string().trim().max(80, "Name is too long.").optional(),
  orderNumber: z.string().trim().max(40, "Order number is too long.").optional(),
  subject: z.string().trim().min(4, "Subject must be at least 4 characters.").max(160, "Subject is too long."),
  message: z.string().trim().min(20, "Message must be at least 20 characters.").max(2000, "Message is too long."),
});

export const wishlistToggleSchema = z.object({
  productId: z.string().cuid("Invalid product."),
  pathname: z.string().trim().min(1).optional(),
});

export const couponFormSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120, "Title is too long."),
    code: z.string().trim().min(3, "Code must be at least 3 characters.").max(40, "Code is too long."),
    description: z.string().trim().max(240, "Description is too long.").optional(),
    type: z.nativeEnum(CouponType),
    amount: z.coerce.number().positive("Amount must be greater than zero."),
    minimumSubtotal: z.coerce.number().min(0, "Minimum subtotal cannot be negative.").optional(),
    usageLimit: z.coerce.number().int().min(1, "Usage limit must be at least 1.").optional(),
    startsAt: z.string().optional(),
    endsAt: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    if (value.type === CouponType.PERCENTAGE && value.amount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Percentage discounts cannot exceed 100.",
      });
    }

    if (value.startsAt && value.endsAt && new Date(value.endsAt) < new Date(value.startsAt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "End date must be after the start date.",
      });
    }
  });

export const couponPreviewSchema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code."),
  items: checkoutRequestSchema.shape.items,
});

export const orderUpdateSchema = z.object({
  orderId: z.string().cuid("Invalid order."),
  status: z.nativeEnum(OrderStatus),
  shippingCarrier: z.string().trim().max(80, "Carrier name is too long.").optional(),
  trackingNumber: z.string().trim().max(80, "Tracking number is too long.").optional(),
  fulfillmentNotes: z.string().trim().max(1000, "Fulfillment notes are too long.").optional(),
});

export const supportTicketAdminUpdateSchema = z.object({
  ticketId: z.string().cuid("Invalid ticket."),
  status: z.nativeEnum(SupportTicketStatus),
  adminResponse: z.string().trim().max(2000, "Response is too long.").optional(),
});
