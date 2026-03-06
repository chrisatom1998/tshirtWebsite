"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/types";
import { formatPriceInput, parsePriceInput, slugify, uniqueStrings } from "@/lib/utils";
import { productFormSchema } from "@/lib/validators";

function parseJsonField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

export async function saveProductAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const title = String(formData.get("title") || "");
  const rawSlug = String(formData.get("slug") || title);
  const images = parseJsonField(formData.get("images"));
  const variants = parseJsonField(formData.get("variants"));

  const parsed = productFormSchema.safeParse({
    id: String(formData.get("id") || "") || undefined,
    title,
    slug: slugify(rawSlug),
    description: String(formData.get("description") || ""),
    price: Number(formData.get("price") || 0),
    featured: formData.get("featured") === "on",
    isActive: formData.get("isActive") === "on",
    images,
    variants,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Review the product fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const basePrice = parsePriceInput(parsed.data.price);
  const imagesPayload = parsed.data.images.map((image, index) => ({
    url: image.url,
    alt: image.alt || `${parsed.data.title} image ${index + 1}`,
    position: index,
  }));
  const variantsPayload = parsed.data.variants.map((variant, index) => ({
    size: variant.size,
    color: variant.color.trim(),
    price: parsePriceInput(variant.price),
    inventory: variant.inventory,
    sortOrder: index,
    isActive: true,
    sku:
      variant.sku?.trim() ||
      `${slugify(parsed.data.slug)}-${variant.size.toLowerCase()}-${slugify(variant.color || "default")}`,
  }));
  const inventoryCount = variantsPayload.reduce((sum, variant) => sum + variant.inventory, 0);
  const sizes = uniqueStrings(variantsPayload.map((variant) => variant.size));
  const colors = uniqueStrings(variantsPayload.map((variant) => variant.color));
  const existing = parsed.data.id ? await db.product.findUnique({ where: { id: parsed.data.id } }) : null;

  try {
    if (parsed.data.id) {
      await db.product.update({
        where: { id: parsed.data.id },
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          price: basePrice,
          featured: parsed.data.featured,
          isActive: parsed.data.isActive,
          inventoryCount,
          sizes,
          colors,
          images: {
            deleteMany: {},
            create: imagesPayload,
          },
          variants: {
            deleteMany: {},
            create: variantsPayload,
          },
        },
      });
    } else {
      await db.product.create({
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          price: basePrice,
          featured: parsed.data.featured,
          isActive: parsed.data.isActive,
          inventoryCount,
          sizes,
          colors,
          images: {
            create: imagesPayload,
          },
          variants: {
            create: variantsPayload,
          },
        },
      });
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save product.",
    };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  if (existing?.slug && existing.slug !== parsed.data.slug) {
    revalidatePath(`/products/${existing.slug}`);
  }

  revalidatePath(`/products/${parsed.data.slug}`);

  redirect("/admin/products");
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "");

  if (!id) {
    return;
  }

  await db.product.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin");
  revalidatePath("/admin/products");

  if (slug) {
    revalidatePath(`/products/${slug}`);
  }
}

export async function duplicateProductValues(productId: string) {
  await requireAdmin();
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: [{ sortOrder: "asc" }, { size: "asc" }] },
    },
  });

  if (!product) {
    redirect("/admin/products");
  }

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: formatPriceInput(product.price),
    featured: product.featured,
    isActive: product.isActive,
    images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
    variants: product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      price: Number(formatPriceInput(variant.price)),
      inventory: variant.inventory,
      sku: variant.sku || "",
    })),
  };
}
