import Stripe from "stripe";
import { db, errorResponse, HttpError, jsonBody, sameOrigin, throttle, verifyCaptcha } from "@/lib/server";
import { checkoutSchema } from "@/lib/validation";
import { getSettings, siteUrl } from "@/lib/data";
export const runtime = "nodejs";
export async function POST(request: Request) {
  let orderId: string | undefined;
  try {
    sameOrigin(request); await throttle(request, "checkout", 8);
    const input = checkoutSchema.parse(await jsonBody(request)); await verifyCaptcha(input.captcha);
    const settings = await getSettings();
    if (!settings.payments_enabled || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) throw new HttpError("Online checkout isn’t available yet. Please message Hailey to order.", 503);
    if (input.fulfillment === "shipping" && (!settings.shipping_enabled || settings.shipping_cents === null) || input.fulfillment === "pickup" && !settings.pickup_enabled) throw new HttpError("That delivery option isn’t available. Please refresh your bag.");
    const { data, error } = await db().rpc("reserve_order", { p_items: input.items, p_email: input.email.toLowerCase(), p_fulfillment: input.fulfillment });
    if (error) throw new HttpError(error.message.includes("unavailable") ? "A set or size in your bag is unavailable. Please refresh the shop and update your bag." : "We couldn’t reserve these sets. Please refresh your bag and try again.", 409);
    orderId = data.id;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment", payment_method_types: ["card"], customer_email: input.email,
      client_reference_id: orderId, metadata: { order_id: orderId! },
      line_items: data.items.map((item: { name: string; size: string; quantity: number; unit_price: number }) => ({ price_data: { currency: "usd", unit_amount: item.unit_price, product_data: { name: item.name, description: `Size ${item.size} · Handmade press-on nails` } }, quantity: item.quantity })),
      ...(input.fulfillment === "shipping" ? { shipping_address_collection: { allowed_countries: ["US" as const] }, shipping_options: [{ shipping_rate_data: { type: "fixed_amount" as const, fixed_amount: { amount: data.shipping_cents, currency: "usd" }, display_name: "Shipping" } }] } : {}),
      billing_address_collection: "required", automatic_tax: { enabled: true },
      success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60
    }, { idempotencyKey: `order-${orderId}` });
    // Once Stripe has a session, only its verified expiry/completion event may release stock.
    const reservedId = orderId; orderId = undefined;
    const result = await db().from("orders").update({ stripe_session_id: session.id }).eq("id", reservedId);
    if (result.error) console.error("Checkout session linkage deferred to webhook", result.error.code);
    return Response.json({ url: session.url });
  } catch (error) {
    // A transport timeout could still have created a Stripe session. Retain the reservation
    // and let the documented reconciliation process decide; never risk overselling.
    if (orderId) console.error("Checkout requires reconciliation for order", orderId);
    return errorResponse(error);
  }
}
