"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, ShoppingBag } from "lucide-react";
import { type Product, type Settings, productPrice, money } from "@/lib/types";
import { useStore } from "./store-provider";
import { EmptyShop } from "./ui";
export function ProductCard({ product }: { product: Product }) {
  const available = product.variants.some(v => v.stock > 0);
  return <Link href={`/shop/${product.slug}`} className="product-card"><div className="product-image">{product.images[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : <div className="product-photo-pending">Photo coming soon</div>}<span className="product-badge">{available ? "Handmade press-ons" : "Currently sold out"}</span><span className="product-arrow"><ArrowUpRight size={17} /></span></div><div className="product-meta"><h3>{product.name}</h3><span className="product-price">{productPrice(product)}</span></div><p>{product.shape} · {product.length}</p></Link>;
}
export function Shop({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState({ shape: "", length: "", size: "", style: "", price: "", availability: "" });
  const options: Record<string, string[]> = {
    shape: [...new Set(products.map(p => p.shape))], length: [...new Set(products.map(p => p.length))],
    size: [...new Set(products.flatMap(p => p.variants.map(v => v.size)))], style: [...new Set(products.map(p => p.style))],
    price: ["Under $20", "$20–$30", "$30 and up"], availability: ["Available now", "Sold out"]
  };
  const filtered = products.filter(p => {
    if (filters.shape && p.shape !== filters.shape || filters.length && p.length !== filters.length || filters.style && p.style !== filters.style) return false;
    const variants = p.variants.filter(v => !filters.size || v.size === filters.size);
    if (filters.size && !variants.length) return false;
    if (filters.availability === "Available now" && !variants.some(v => v.stock > 0)) return false;
    if (filters.availability === "Sold out" && variants.some(v => v.stock > 0)) return false;
    if (filters.price && !variants.some(v => v.price_cents !== null && (filters.price === "Under $20" ? v.price_cents < 2000 : filters.price === "$20–$30" ? v.price_cents >= 2000 && v.price_cents < 3000 : v.price_cents >= 3000))) return false;
    return true;
  });
  const active = Object.values(filters).some(Boolean);
  return <><div className="shop-toolbar"><div className="shop-filters">{Object.entries(options).map(([key, values]) => <select key={key} aria-label={`Filter by ${key}`} value={filters[key as keyof typeof filters]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}><option value="">{key === "availability" ? "Availability" : `All ${key === "price" ? "prices" : key === "size" ? "sizes" : key === "length" ? "lengths" : key === "style" ? "styles" : "shapes"}`}</option>{values.filter(Boolean).map(value => <option key={value}>{value}</option>)}</select>)}{active && <button className="icon-button" onClick={() => setFilters({ shape: "", length: "", size: "", style: "", price: "", availability: "" })} aria-label="Clear filters">↺</button>}</div><span className="result-count">{filtered.length} {filtered.length === 1 ? "little work of art" : "little works of art"}</span></div>{!products.length ? <EmptyShop /> : filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="no-results"><h3>No sets quite like that yet.</h3><p>Try another filter, or have Hailey make something just for you.</p><Link href="/custom" className="text-link">Create a custom set <ArrowRight size={15} /></Link></div>}<p className="shop-bottom-note">Have a particular look in mind? <Link href="/custom">Let’s make it yours.</Link></p></>;
}
export function ProductDetail({ product, settings }: { product: Product; settings: Settings }) {
  const [photo, setPhoto] = useState(0), [variantId, setVariantId] = useState(product.variants.find(v => v.stock > 0)?.id || product.variants[0]?.id || "");
  const { add } = useStore();
  const variant = product.variants.find(v => v.id === variantId);
  function addItem() {
    if (!variant || variant.price_cents === null || variant.stock < 1) return;
    add({ variantId: variant.id, productId: product.id, slug: product.slug, name: product.name, image: product.images[0] || "", shape: product.shape, length: product.length, size: variant.size, price: variant.price_cents, quantity: 1 });
  }
  return <div className="product-layout"><div className="product-gallery">{product.images.length ? <img className="main-image" src={product.images[photo]} alt={`${product.name}${photo ? `, view ${photo + 1}` : ""}`} /> : <div className="main-image product-photo-pending">Owner photos coming soon</div>}{product.images.length > 1 && <div className="thumbnails">{product.images.map((src, i) => <button key={src} onClick={() => setPhoto(i)} aria-label={`View photo ${i + 1}`} aria-pressed={photo === i}><img src={src} alt="" /></button>)}</div>}</div><div className="product-info"><span className="eyebrow">A LITTLE WORK OF ART, BY HAILEY</span><h1>{product.name}</h1><p className="price">{variant?.price_cents !== null && variant?.price_cents !== undefined ? money(variant.price_cents) : productPrice(product)}</p><p className="description">{product.description}</p><div className="product-facts"><span>{product.shape}</span><span>{product.length}</span><span>{product.style}</span></div><div className="size-label"><span className="field-label">Choose your size</span><Link className="text-link" href="/size-guide">Find your fit <ArrowUpRight size={14} /></Link></div><div className="size-options">{product.variants.map(v => <button key={v.id} disabled={v.stock < 1} onClick={() => setVariantId(v.id)} aria-pressed={variantId === v.id}>{v.size}</button>)}</div><p className="inline-note">{variant && variant.stock > 0 ? "Available · Handmade with care" : "This size is currently sold out"}</p><button className="button button-dark add-button" onClick={addItem} disabled={!variant || variant.stock < 1 || variant.price_cents === null}>Add to your bag <ShoppingBag size={17} /></button>{!settings.payments_enabled && <p className="inline-note">Online checkout is being prepared. You can explore the collection and contact Hailey to order.</p>}<div className="details-block"><h3>The little details</h3><p>{product.included || "Message Hailey to confirm exactly what’s included with this set."}</p></div><div className="details-block"><h3>A little love goes a long way.</h3><p>Made to be worn again when removed and cared for gently. Wear and reusability depend on your adhesive, application, and care.</p><Link className="text-link" href="/faq#care">Application & care guide <ArrowRight size={14} /></Link></div>{settings.processing && <div className="details-block"><h3>Getting your set</h3><p>{settings.processing}</p></div>}</div></div>;
}
