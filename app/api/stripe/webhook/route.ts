import Stripe from "stripe";
import { db, notify } from "@/lib/server";
import { getSettings } from "@/lib/data";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) return new Response("Payments not configured", { status: 503 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") || "", process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return new Response("Invalid signature", { status: 400 }); }
  if (!["checkout.session.completed", "checkout.session.expired", "checkout.session.async_payment_succeeded"].includes(event.type)) return Response.json({ received: true });
  try {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.order_id) return Response.json({ received: true });
    if (event.type !== "checkout.session.expired" && session.payment_status !== "paid") return Response.json({ received: true });
    const { error } = await db().rpc("process_payment_event", {
      p_event: event.id, p_order: session.metadata.order_id, p_session: session.id,
      p_paid: event.type !== "checkout.session.expired", p_subtotal: session.amount_subtotal,
      p_shipping: session.total_details?.amount_shipping || 0, p_total: session.amount_total,
      p_currency: session.currency, p_customer: session.customer_details, p_shipping_details: session.collected_information?.shipping_details || null
    });
    if (error) throw error;
    if (event.type !== "checkout.session.expired") {
      const { data: order } = await db().from("orders").select("id,email,email_sent,fulfillment,total_cents").eq("id", session.metadata.order_id).single();
      if (order && !order.email_sent && process.env.RESEND_API_KEY && process.env.FROM_EMAIL) {
        const settings = await getSettings();
        // Deterministic provider key prevents duplicate receipts when webhook delivery retries.
        const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `receipt-${order.id}` }, body: JSON.stringify({ from: process.env.FROM_EMAIL, to: [order.email], subject: "Your little works of art are ordered ♡", text: `Thank you for your order!\n\nOrder reference: ${order.id}\nTotal paid: $${(order.total_cents / 100).toFixed(2)} USD\n\n${order.fulfillment === "pickup" ? settings.pickup_instructions : settings.shipping_policy}\n\n${settings.processing}\n\nWith lots of love,\nHailey` }), signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error("Receipt delivery failed");
        const sent = await db().from("orders").update({ email_sent: true }).eq("id", order.id); if (sent.error) throw sent.error;
        await notify("A new Nails by Hailey order is paid", `Order ${order.id} is verified as paid. Sign in to the owner dashboard for fulfillment.`).catch(() => undefined);
      }
    }
    return Response.json({ received: true });
  } catch (error) { console.error("Payment webhook needs retry", error instanceof Error ? error.message : "Database error"); return new Response("Please retry", { status: 500 }); }
}
