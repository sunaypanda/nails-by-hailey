import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { PageIntro, CustomBanner } from "@/components/ui";
import { getSettings } from "@/lib/data";
export const metadata: Metadata = { title: "Meet Hailey", alternates: { canonical: "/about" } };
export const dynamic = "force-dynamic";
export default async function About() {
  const settings = await getSettings();
  return <><PageIntro eyebrow="THE HANDS BEHIND THE LITTLE DETAILS" title={<>Hi, I’m <em>Hailey.</em></>}><p>Houston maker. Nail-design lover.<br />The person putting a little love into your next set.</p></PageIntro><div className="container page-content"><div className="about-page-grid"><div className="about-art">{settings.about_image ? <img src={settings.about_image} alt="A little look at Hailey’s handmade nail designs" /> : <><span className="eyebrow">NAILS BY HAILEY · HOUSTON, TEXAS</span><span className="about-art-title">From my hands<br /><em>to yours.</em></span><Heart size={32} strokeWidth={1} /></>}</div><div className="prose"><h2>Little works of art.<br /><em>Made to feel like you.</em></h2><p>I’m Hailey Lovelady, the maker behind Nails by Hailey. I create handmade, reusable press-on nails here in Houston, Texas.</p><p>My little shop is all about personal style, creativity, and care. Maybe that’s a simple solid color. Maybe it’s a French tip with a tiny twist. Or maybe it’s a custom design full of your favorite details.</p><p>You choose your look, and apply your set yourself at home. No nail appointment needed, just a little time for something that feels like you.</p><p>If you have an idea, I’d love to hear it. Let’s make your fingertips a little more personal.</p><span className="small-script">With lots of love, Hailey ♡</span><div style={{ marginTop: 25 }}><Link className="text-link" href="/shop">Find your next set <ArrowRight size={16} /></Link></div></div></div><div style={{ marginTop: 65 }}><CustomBanner /></div></div></>;
}
