export type Variant = { id: string; size: string; price_cents: number | null; stock: number; revision?: number };
export type Product = { id: string; slug: string; name: string; description: string; shape: string; length: string; style: string; images: string[]; included: string; published: boolean; featured: boolean; variants: Variant[] };
export type Settings = {
  payments_enabled: boolean; shipping_enabled: boolean; pickup_enabled: boolean;
  shipping_cents: number | null; processing: string; shipping_policy: string; returns_policy: string;
  pickup_instructions: string; sizing: Record<string, number[]>;
  custom_min_cents: number | null; custom_max_cents: number | null; charm_surcharge_cents: number | null;
  hero_image: string; about_image: string; instagram_images: string[];
};
export type CartItem = { variantId: string; productId: string; slug: string; name: string; image: string; shape: string; length: string; size: string; price: number; quantity: number };
export const defaultSettings: Settings = {
  payments_enabled: false, shipping_enabled: false, pickup_enabled: false, shipping_cents: null,
  processing: "", shipping_policy: "", returns_policy: "", pickup_instructions: "", sizing: {},
  custom_min_cents: null, custom_max_cents: null, charm_surcharge_cents: null,
  hero_image: "", about_image: "", instagram_images: []
};
export const instagram = "https://www.instagram.com/pressonnailsbyhailey/";
export const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
export function productPrice(product: Product) {
  const prices = product.variants.map(v => v.price_cents).filter((n): n is number => n !== null);
  if (!prices.length) return "Ask Hailey for pricing";
  const min = Math.min(...prices), max = Math.max(...prices);
  return min === max ? money(min) : `${money(min)}–${money(max)}`;
}
