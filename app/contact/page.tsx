import type { Metadata } from "next";
import { Instagram, MapPin, ArrowUpRight, Heart } from "lucide-react";
import { PageIntro } from "@/components/ui";
import { InquiryForm } from "@/components/inquiry-form";
import { getSettings } from "@/lib/data";
import { instagram } from "@/lib/types";
export const metadata: Metadata = { title: "Get in touch", alternates: { canonical: "/contact" } };
export const dynamic = "force-dynamic";
export default async function ContactPage() { return <><PageIntro eyebrow="QUESTIONS, IDEAS, OR JUST A LITTLE HELLO" title={<>Let’s <em>talk nails.</em></>}><p>Need help with sizing, a set, or the little details?<br />I’d love to hear from you.</p></PageIntro><div className="container page-content form-layout"><aside className="form-aside"><Heart size={27} strokeWidth={1} /><h2>A real person.<br /><em>A little small business.</em></h2><p>Your message comes to Hailey, the hands behind your nails. You can also find me on Instagram.</p><div className="contact-links"><a href={instagram} target="_blank" rel="noopener noreferrer"><Instagram size={18} /> @pressonnailsbyhailey <ArrowUpRight size={14} /></a><span><MapPin size={16} /> Houston, Texas</span></div><span className="small-script">With lots of love, Hailey ♡</span></aside><InquiryForm settings={await getSettings()} contact /></div></>; }
