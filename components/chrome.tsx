"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, Heart, Instagram, Menu, ShoppingBag, X } from "lucide-react";
import { useStore } from "./store-provider";
import { instagram } from "@/lib/types";
const links = [["Shop press-ons", "/shop"], ["Create a custom set", "/custom"], ["Size guide", "/size-guide"], ["Meet Hailey", "/about"]];
export function Header() {
  const { items } = useStore(), pathname = usePathname(), [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return <><div className="announcement"><span>HANDMADE IN HOUSTON, TEXAS</span><span className="announcement-love">With lots of love <Heart size={11} /></span><a href={instagram} target="_blank" rel="noopener noreferrer">LET’S BE INSTA FRIENDS <ArrowUpRight size={12} /></a></div><header className="header"><div className="nav-wrap"><Link href="/" className="wordmark" aria-label="Nails by Hailey home">nails <span>by Hailey</span><i>♡</i></Link><nav className="desktop-nav" aria-label="Main navigation">{links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>{label}</Link>)}</nav><div className="nav-actions"><Link href="/cart" className="bag-link" aria-label={`Shopping bag, ${items.reduce((n, i) => n + i.quantity, 0)} items`}><ShoppingBag size={20} /><span className="bag-count">{items.reduce((n, i) => n + i.quantity, 0)}</span></Link><button className="icon-button mobile-menu-button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></div>{open && <nav className="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}<ArrowUpRight size={18} /></Link>)}<Link href="/contact">Get in touch<ArrowUpRight size={18} /></Link></nav>}</header></>;
}
export function Footer() {
  return <footer className="footer"><div className="footer-main container"><div><Link className="wordmark" href="/">nails <span>by Hailey</span><i>♡</i></Link><p>Little works of art.<br />Made for your everyday.</p><a className="social-link" href={instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} /> @pressonnailsbyhailey <ArrowUpRight size={15} /></a></div><div><span className="eyebrow">FIND YOUR SET</span><Link href="/shop">Shop press-ons</Link><Link href="/custom">Create a custom set</Link><Link href="/size-guide">Find your fit</Link></div><div><span className="eyebrow">A LITTLE HELP</span><Link href="/faq">FAQs & nail care</Link><Link href="/contact">Get in touch</Link><Link href="/about">Meet Hailey</Link></div><div className="footer-note"><Heart size={23} strokeWidth={1} /><p>Designed by you.<br />Handmade by Hailey.</p><span>HOUSTON, TEXAS</span></div></div><div className="footer-bottom container"><span>© {new Date().getFullYear()} Nails by Hailey</span><span>With lots of love, always.</span><Link href="/privacy">Privacy</Link></div></footer>;
}
