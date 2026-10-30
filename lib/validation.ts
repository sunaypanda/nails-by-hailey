import { z } from "zod";
export const variantSchema = z.object({ id: z.string().uuid().optional(), size: z.string().trim().min(1).max(30), price_cents: z.number().int().min(50).max(1000000).nullable(), stock: z.number().int().min(0).max(1000), revision: z.number().int().min(0).optional() });
export const productSchema = z.object({
  id: z.string().uuid().optional(), slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase, hyphen-separated product URL."),
  name: z.string().trim().min(1).max(100), description: z.string().trim().min(1).max(3000), shape: z.string().trim().min(1).max(50), length: z.string().trim().min(1).max(50), style: z.string().trim().min(1).max(80), included: z.string().max(2000),
  images: z.array(z.string().url()).max(8), published: z.boolean(), featured: z.boolean(), variants: z.array(variantSchema).min(1).max(20)
}).superRefine((p, ctx) => {
  if (p.published && !p.images.length) ctx.addIssue({ code: "custom", message: "Upload an actual photo of this set before publishing." });
  if (new Set(p.variants.map(v => v.size.toLowerCase())).size !== p.variants.length) ctx.addIssue({ code: "custom", message: "Each size may only appear once." });
});
export const settingsSchema = z.object({
  payments_enabled: z.boolean(), shipping_enabled: z.boolean(), pickup_enabled: z.boolean(), shipping_cents: z.number().int().min(0).max(100000).nullable(),
  processing: z.string().max(3000), shipping_policy: z.string().max(5000), returns_policy: z.string().max(5000), pickup_instructions: z.string().max(3000),
  sizing: z.record(z.enum(["XS", "S", "M", "L"]), z.array(z.number().min(1).max(30)).length(5)).or(z.object({}).strict()),
  custom_min_cents: z.number().int().min(0).max(1000000).nullable(), custom_max_cents: z.number().int().min(0).max(1000000).nullable(), charm_surcharge_cents: z.number().int().min(0).max(100000).nullable(),
  hero_image: z.union([z.literal(""), z.string().url()]), about_image: z.union([z.literal(""), z.string().url()]), instagram_images: z.array(z.string().url()).max(4)
}).superRefine((s, ctx) => {
  if (s.custom_max_cents !== null && (s.custom_min_cents === null || s.custom_max_cents < s.custom_min_cents)) ctx.addIssue({ code: "custom", message: "Set a minimum custom price no higher than the maximum." });
  if (s.payments_enabled && (!s.processing.trim() || !s.returns_policy.trim() || !s.shipping_policy.trim() || (!s.shipping_enabled && !s.pickup_enabled) || s.shipping_enabled && s.shipping_cents === null)) ctx.addIssue({ code: "custom", message: "Before enabling payments, confirm processing, delivery and returns policies, a fulfillment option, and any shipping fee." });
  if (s.payments_enabled && s.pickup_enabled && !s.pickup_instructions.trim()) ctx.addIssue({ code: "custom", message: "Add private pickup instructions before enabling pickup payments." });
});
export const checkoutSchema = z.object({ items: z.array(z.object({ variant_id: z.string().uuid(), quantity: z.number().int().min(1).max(10) })).min(1).max(30), email: z.string().trim().email().max(200), fulfillment: z.enum(["shipping", "pickup"]), captcha: z.string().min(1).max(3000) }).refine(data => new Set(data.items.map(i => i.variant_id)).size === data.items.length, "Duplicate bag items. Please clear your bag and add your sets again.");
