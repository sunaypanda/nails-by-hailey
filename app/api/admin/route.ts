import { z } from "zod";
import { db, errorResponse, HttpError, jsonBody, requireAdmin, sameOrigin } from "@/lib/server";
import { defaultSettings } from "@/lib/types";
import { productSchema, settingsSchema } from "@/lib/validation";
import { validateImageUrl } from "@/lib/uploads";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await requireAdmin(); const client = db();
    const [products, settings, inquiries, orders] = await Promise.all([
      client.from("products").select("*,variants(*)").order("created_at", { ascending: false }),
      client.from("settings").select("value").eq("id", "store").single(),
      client.from("inquiries").select("id,reference,kind,name,email,details,photos,status,created_at").order("created_at", { ascending: false }).limit(100),
      client.from("orders").select("*,order_items(*)").order("created_at", { ascending: false }).limit(100)
    ]);
    for (const result of [products, settings, inquiries, orders]) if (result.error) throw result.error;
    const signed = await Promise.all((inquiries.data || []).map(async inquiry => ({ ...inquiry, photos: await Promise.all((inquiry.photos as string[]).map(async path => {
      const { data, error } = await client.storage.from("inquiry-photos").createSignedUrl(path, 300);
      if (error) throw error; return data.signedUrl;
    })) })));
    return Response.json({ products: products.data, settings: { ...defaultSettings, ...settings.data?.value }, inquiries: signed, orders: orders.data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
export async function PATCH(request: Request) {
  try {
    sameOrigin(request); await requireAdmin();
    const body = z.object({ kind: z.enum(["product", "settings", "inquiry", "order"]), value: z.unknown() }).parse(await jsonBody(request));
    if (body.kind === "product") {
      const product = productSchema.parse(body.value);
      product.images.forEach(validateImageUrl);
      if (product.published && product.variants.some(v => ["XS", "S", "M", "L"].includes(v.size))) {
        const { data, error } = await db().from("settings").select("value").eq("id", "store").single(); if (error) throw error;
        for (const v of product.variants) if (["XS", "S", "M", "L"].includes(v.size) && !data?.value.sizing?.[v.size]) throw new HttpError(`Confirm the ${v.size} measurements in store settings before publishing this set.`);
      }
      const { error } = await db().rpc("save_product", { p_product: product }); if (error) throw error;
    } else if (body.kind === "settings") {
      const settings = settingsSchema.parse(body.value);
      [settings.hero_image, settings.about_image, ...settings.instagram_images].forEach(validateImageUrl);
      if (settings.payments_enabled && (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") || !process.env.TURNSTILE_SECRET_KEY || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) throw new HttpError("Connect Stripe, the webhook, a production HTTPS site URL, and Turnstile before enabling payments.");
      const { error } = await db().from("settings").update({ value: settings }).eq("id", "store"); if (error) throw error;
    } else if (body.kind === "inquiry") {
      const input = z.object({ id: z.string().uuid(), status: z.enum(["received", "reviewing", "quoted", "agreed", "creating", "completed", "closed"]) }).parse(body.value);
      const { error } = await db().from("inquiries").update({ status: input.status }).eq("id", input.id); if (error) throw error;
    } else {
      const input = z.object({ id: z.string().uuid(), status: z.enum(["new", "preparing", "ready", "shipped", "collected"]) }).parse(body.value);
      const { data, error } = await db().from("orders").update({ fulfillment_status: input.status }).eq("id", input.id).eq("payment_status", "paid").select("id");
      if (error) throw error; if (!data?.length) throw new HttpError("Only verified paid orders can be fulfilled.");
    }
    return Response.json({ ok: true });
  } catch (error) { return errorResponse(error); }
}
