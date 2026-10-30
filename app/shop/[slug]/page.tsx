import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getSettings } from "@/lib/data";
import { ProductDetail } from "@/components/shop";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params, product = (await getProducts()).find(p => p.slug === slug);
  if (!product) return { title: "Set not found" };
  return { title: product.name, description: product.description, alternates: { canonical: `/shop/${slug}` }, openGraph: { title: product.name, description: product.description, images: product.images.length ? product.images : ["/opengraph-image"] } };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params, [products, settings] = await Promise.all([getProducts(), getSettings()]), product = products.find(p => p.slug === slug);
  if (!product) notFound();
  return <div className="container page-content"><div className="breadcrumbs"><Link href="/">Home</Link> / <Link href="/shop">Shop press-ons</Link> / <span>{product.name}</span></div><ProductDetail product={product} settings={settings} /></div>;
}
