export const BRAND_NAME = "Threadline Supply";
export const BRAND_TAGLINE = "Graphic t-shirts for late shifts, long drives, and repeat wear.";
export const BRAND_DESCRIPTION =
  "Threadline Supply is a modern t-shirt label focused on heavyweight blanks, bold prints, and clean fits.";

export const SHIRT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const CURRENCY = "usd";
export const SESSION_COOKIE_NAME = "threadline-admin-session";
export const CUSTOMER_SESSION_COOKIE_NAME = "threadline-customer-session";
export const CART_STORAGE_KEY = "threadline-cart";
export const COUPON_STORAGE_KEY = "threadline-coupon-code";
export const STANDARD_SHIPPING_RATE = 795;
export const EXPRESS_SHIPPING_RATE = 1495;
export const CHECKOUT_RESERVATION_MINUTES = 30;
export const PRODUCT_PAGE_SIZE = 6;
export const PRODUCT_SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title-asc", label: "Alphabetical" },
] as const;
