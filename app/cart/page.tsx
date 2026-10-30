import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { Cart } from "@/components/cart";
import { getSettings } from "@/lib/data";
export const metadata: Metadata = { title: "Your bag", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function CartPage() { return <><PageIntro eyebrow="A FEW LITTLE THINGS TO LOVE" title={<>Good things <em>in the bag.</em></>} /><div className="container page-content"><Cart settings={await getSettings()} /></div></>; }
