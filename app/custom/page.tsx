import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ArrowUpRight } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { InquiryForm } from "@/components/inquiry-form";
import { getSettings } from "@/lib/data";
export const metadata: Metadata = { title: "Create a custom set", alternates: { canonical: "/custom" } };
export const dynamic = "force-dynamic";
export default async function CustomPage() { return <><PageIntro eyebrow="YOUR IDEAS. MY LITTLE CANVAS." title={<>Let’s make something <em>so you.</em></>}><p>From the colors to the tiniest charm, tell me what you’re dreaming of.<br />We’ll work out the little details together.</p></PageIntro><div className="container page-content form-layout"><aside className="form-aside"><Heart size={26} strokeWidth={1} /><h2>Designed by you.<br /><em>Handmade by me.</em></h2><p>A saved photo, a favorite color, a little spark of an idea. That’s all we need to start.</p><ol><li>Share your ideas and your fit.</li><li>I’ll confirm the design, price, and timing.</li><li>Once everything’s agreed, we’ll arrange your order.</li></ol><p>Custom requests are subject to design and schedule availability. Sending this form doesn’t place an order.</p><Link className="text-link" href="/track">Already sent a request? <ArrowUpRight size={14} /></Link><span className="small-script">With lots of love, Hailey ♡</span></aside><InquiryForm settings={await getSettings()} /></div></>; }
