import type { Metadata } from "next";
import Stripe from "stripe";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { db } from "@/lib/server";
import { money } from "@/lib/types";
import { ClearPaidCart } from "@/components/clear-paid-cart";
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let order: { id: string; total_cents: number } | null = null, pending = false;
  if (process.env.STRIPE_SECRET_KEY && session_id?.startsWith("cs_") && session_id.length < 300) {
    try {
      const session = await new Stripe(process.env.STRIPE_SECRET_KEY).checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid" && session.metadata?.order_id) {
        const { data, error } = await db().from("orders").select("id,total_cents,payment_status,stripe_session_id").eq("id", session.metadata.order_id).single();
        if (error) throw error;
        if (data.payment_status === "paid" && data.stripe_session_id === session.id) order = data;
        else pending = true;
      }
    } catch { pending = true; }
  }
  return <div className="container" style={{ maxWidth: 800, paddingTop: 60, paddingBottom: 80 }}><div className="success-box"><Heart size={40} strokeWidth={1} /><span className="eyebrow">WITH LOTS OF LOVE</span><h1 style={{ fontSize: 53, margin: "18px 0" }}>{order ? <>A little joy, <em>on its way.</em></> : pending ? <>Checking the <em>little details.</em></> : <>Let’s find your <em>little details.</em></>}</h1><p>{order ? "Your payment has been verified and your order is with Hailey. Save your reference below. If email delivery is connected, your confirmation will arrive by email." : pending ? "Your payment confirmation is still being checked. Please refresh this page in a moment. Don’t pay again; contact Hailey if your confirmation doesn’t appear." : "We couldn’t find a verified order here. You can return to your bag or contact Hailey if you need help."}</p>{order && <><ClearPaidCart /><div className="reference">{order.id}</div><p>Total paid: {money(order.total_cents)}</p></>}{pending ? <Link className="button button-dark" href={`/checkout/success?session_id=${encodeURIComponent(session_id || "")}`} prefetch={false}>Check confirmation again</Link> : <Link className="button button-dark" href={order ? "/shop" : "/cart"}>{order ? "A little more browsing" : "Back to your bag"}<ArrowRight size={16} /></Link>}<div style={{ marginTop: 20 }}><Link href="/contact" className="text-link">Need a hand? Contact Hailey ↗</Link></div></div></div>;
}
