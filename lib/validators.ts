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
});
