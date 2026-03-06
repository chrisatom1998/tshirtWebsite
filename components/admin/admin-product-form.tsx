"use client";

import { useActionState, useState } from "react";
import { Plus, Upload, X } from "lucide-react";

import { saveProductAction } from "@/app/actions/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingButton } from "@/components/ui/pending-button";
import { Textarea } from "@/components/ui/textarea";
import { SHIRT_SIZES } from "@/lib/constants";
import type { ActionState } from "@/lib/types";
import { slugify } from "@/lib/utils";

type ProductFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  featured: boolean;
  isActive: boolean;
  images: Array<{ url: string; alt?: string }>;
  variants: Array<{ size: string; color: string; price: number; inventory: number; sku?: string }>;
};

const initialState: ActionState = { status: "idle" };

const defaultVariant = {
  size: "M",
  color: "Black",
  price: 42,
  inventory: 10,
  sku: "",
};

export function AdminProductForm({ initialValues }: { initialValues?: ProductFormValues }) {
  const [state, formAction] = useActionState(saveProductAction, initialState);
  const [title, setTitle] = useState(initialValues?.title || "");
  const [slug, setSlug] = useState(initialValues?.slug || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [price, setPrice] = useState(initialValues?.price || "40.00");
  const [featured, setFeatured] = useState(initialValues?.featured ?? false);
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true);
  const [images, setImages] = useState(initialValues?.images || []);
  const [variants, setVariants] = useState(initialValues?.variants || [defaultVariant]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const addImageUrl = () => {
    if (!manualImageUrl.trim()) {
      return;
    }

    setImages((current) => [...current, { url: manualImageUrl.trim() }]);
    setManualImageUrl("");
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }

    setUploadError("");
    setIsUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.url) {
        setUploadError(payload?.message || `Unable to upload ${file.name}.`);
        continue;
      }

      setImages((current) => [...current, { url: payload.url }]);
    }

    setIsUploading(false);
  };

  return (
    <form action={formAction} className="space-y-8">
      {initialValues?.id ? <input type="hidden" name="id" value={initialValues.id} /> : null}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />

      <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="glass-panel space-y-6 p-6">
          <div className="space-y-2">
            <Label>Product title</Label>
            <Input
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => {
                if (!slug.trim()) {
                  setSlug(slugify(title));
                }
              }}
              placeholder="After Hours Heavy Tee"
              required
            />
            {state.fieldErrors?.title ? <p className="text-sm text-red-600">{state.fieldErrors.title[0]}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr,auto] md:items-end">
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input name="slug" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="after-hours-heavy-tee" required />
              {state.fieldErrors?.slug ? <p className="text-sm text-red-600">{state.fieldErrors.slug[0]}</p> : null}
            </div>
            <Button type="button" variant="ghost" onClick={() => setSlug(slugify(title))}>
              Regenerate slug
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the fabric, fit, artwork, and why someone should buy this shirt."
              required
            />
            {state.fieldErrors?.description ? <p className="text-sm text-red-600">{state.fieldErrors.description[0]}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Base price (USD)</Label>
              <Input name="price" type="number" min="1" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
              {state.fieldErrors?.price ? <p className="text-sm text-red-600">{state.fieldErrors.price[0]}</p> : null}
            </div>
            <div className="grid gap-3 rounded-[1.5rem] border border-black/10 bg-white/70 p-4 text-sm text-black/65">
              <label className="flex items-center gap-3">
                <input type="checkbox" name="featured" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
                Featured on homepage
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" name="isActive" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
                Visible in storefront
              </label>
            </div>
          </div>
        </div>

        <div className="glass-panel space-y-5 p-6">
          <div className="space-y-2">
            <Label>Product images</Label>
            <div className="grid gap-3 md:grid-cols-[1fr,auto]">
              <Input value={manualImageUrl} onChange={(event) => setManualImageUrl(event.target.value)} placeholder="Paste an image URL or local /products path" />
              <Button type="button" variant="ghost" onClick={addImageUrl}>
                Add image URL
              </Button>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-black/20 bg-white/70 px-4 py-5 text-sm font-medium text-black/65 hover:border-black/35 hover:text-ink">
              <Upload className="h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload image files"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => uploadFiles(event.target.files)} />
            </label>
            {uploadError ? <p className="text-sm text-red-600">{uploadError}</p> : null}
            {state.fieldErrors?.images ? <p className="text-sm text-red-600">{state.fieldErrors.images[0]}</p> : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image, index) => (
              <div key={`${image.url}-${index}`} className="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-2">
                <button
                  type="button"
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2 text-white"
                  onClick={() => setImages((current) => current.filter((_, imageIndex) => imageIndex !== index))}
                >
                  <X className="h-4 w-4" />
                </button>
                <img src={image.url} alt={image.alt || `Product image ${index + 1}`} className="aspect-square w-full rounded-[1rem] object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel space-y-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Variants</p>
            <p className="mt-2 text-sm text-black/65">Set the size, color, price, and inventory for each purchasable combination.</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setVariants((current) => [
                ...current,
                { ...defaultVariant, price: Number(price || defaultVariant.price) },
              ])
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add variant
          </Button>
        </div>
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div key={`${variant.size}-${variant.color}-${index}`} className="grid gap-4 rounded-[1.5rem] border border-black/10 bg-white/70 p-4 md:grid-cols-[0.8fr,1fr,0.8fr,0.8fr,1fr,auto]">
              <div className="space-y-2">
                <Label>Size</Label>
                <select
                  className="ring-focus h-11 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink"
                  value={variant.size}
                  onChange={(event) => {
                    const nextVariants = [...variants];
                    nextVariants[index] = { ...variant, size: event.target.value };
                    setVariants(nextVariants);
                  }}
                >
                  {SHIRT_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  value={variant.color}
                  onChange={(event) => {
                    const nextVariants = [...variants];
                    nextVariants[index] = { ...variant, color: event.target.value };
                    setVariants(nextVariants);
                  }}
                  placeholder="Black"
                />
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={variant.price}
                  onChange={(event) => {
                    const nextVariants = [...variants];
                    nextVariants[index] = { ...variant, price: Number(event.target.value || 0) };
                    setVariants(nextVariants);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Inventory</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={variant.inventory}
                  onChange={(event) => {
                    const nextVariants = [...variants];
                    nextVariants[index] = { ...variant, inventory: Number(event.target.value || 0) };
                    setVariants(nextVariants);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input
                  value={variant.sku || ""}
                  onChange={(event) => {
                    const nextVariants = [...variants];
                    nextVariants[index] = { ...variant, sku: event.target.value };
                    setVariants(nextVariants);
                  }}
                  placeholder="Optional"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={variants.length === 1}
                  onClick={() => setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index))}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
        {state.fieldErrors?.variants ? <p className="text-sm text-red-600">{state.fieldErrors.variants[0]}</p> : null}
      </div>

      {state.message ? <p className="text-sm text-red-600">{state.message}</p> : null}
      <PendingButton size="lg" pendingLabel="Saving product...">
        Save product
      </PendingButton>
    </form>
  );
}
