import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import { PageIntro } from "@/components/ui";
import { Shop } from "@/components/shop";
export const metadata: Metadata = { title: "Shop press-ons", alternates: { canonical: "/shop" } };
export const dynamic = "force-dynamic";
export default async function ShopPage() { return <><PageIntro eyebrow="THE PRESS-ON COLLECTION" title={<>Little sets. <em>Big personality.</em></>}><p>Handmade, reusable, and ready to make your look a little more you.<br />Find the set that feels like it was made for your mood.</p></PageIntro><div className="container page-content"><Shop products={await getProducts()} /></div></>; }
