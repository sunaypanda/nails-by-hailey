import Link from "next/link";
import { ArrowDown, ArrowRight, Heart, Sparkles } from "lucide-react";
export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return <div className="page-intro container"><div className="eyebrow"><span className="tiny-flower">✳</span> {eyebrow}</div><h1>{title}</h1>{children && <div className="intro-copy">{children}</div>}</div>;
}
export function CustomBanner() {
  return <section className="custom-banner"><div className="custom-banner-art" aria-hidden="true"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><Heart className="banner-heart" strokeWidth={1} /><span className="handwritten">so you.</span></div><div><span className="eyebrow">YOUR IDEAS. MY LITTLE CANVAS.</span><h2>Dream it. <em>I’ll make it.</em></h2><p>A color you love. A special occasion. That design living rent-free on your saved board. Let’s turn it into your next set.</p><Link className="button button-dark" href="/custom">Let’s create your set <ArrowRight size={17} /></Link></div></section>;
}
export function EmptyShop() {
  return <div className="empty-shop"><div className="empty-icon"><ShoppingIllustration /></div><span className="eyebrow">A LITTLE SOMETHING IS IN THE MAKING</span><h3>Your next favorite set is on its way.</h3><p>New handmade sets will appear right here. In the meantime, tell Hailey what you have in mind.</p><Link href="/custom" className="text-link">Dream up a custom set <ArrowRight size={16} /></Link></div>;
}
function ShoppingIllustration() { return <Heart size={32} strokeWidth={1} />; }
export function HowItWorks() {
  return <section className="section how-section container"><div className="section-heading"><div><span className="eyebrow">GOOD NAILS, WITHOUT THE APPOINTMENT</span><h2>Your new nail routine.</h2></div><span className="small-script">easy as one, two, three.</span></div><div className="steps">{[
    ["01", "Find your favorite", "Pick a handmade set from the shop, or dream up something completely your own.", "Shop the collection", "/shop"],
    ["02", "Make it your fit", "A little measuring makes all the difference. Find your size for a comfortable, personal fit.", "Find your size", "/size-guide"],
    ["03", "Press on. Head out.", "Apply your set at home, enjoy your look, and remove gently when you’re ready for a change.", "Nail care & FAQs", "/faq"]
  ].map(([number, title, description, label, href]) => <article key={number}><span className="step-number">{number}<ArrowDown size={20} strokeWidth={1} /></span><h3>{title}</h3><p>{description}</p><Link href={href} className="text-link">{label}<ArrowRight size={14} /></Link></article>)}</div></section>;
}
