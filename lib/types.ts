export type CartItem = {
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  imageUrl: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  inventory: number;
};

export type CheckoutSnapshotItem = {
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  imageUrl: string;
  sku: string | null;
  size: string;
  color: string;
  listUnitAmount: number;
  unitAmount: number;
  discountAmount: number;
  quantity: number;
  totalAmount: number;
};

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type AdminImageInput = {
  url: string;
  alt?: string;
};

export type AdminVariantInput = {
  size: string;
  color: string;
  price: number;
  inventory: number;
  sku?: string;
};

export type AdminProductFormValues = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  featured: boolean;
  isActive: boolean;
  images: AdminImageInput[];
  variants: AdminVariantInput[];
};

export type AppliedCoupon = {
  code: string;
  title: string;
  description?: string | null;
  discountAmount: number;
};
