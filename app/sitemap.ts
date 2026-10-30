import type { MetadataRoute } from "next";
import { getProducts, siteUrl } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/shop", "/custom", "/size-guide", "/about", "/faq", "/contact", "/privacy", ...(await getProducts()).map(p => `/shop/${p.slug}`)];
  return paths.map(path => ({ url: `${siteUrl()}${path}`, changeFrequency: path.startsWith("/shop") ? "daily" : "monthly", priority: path === "" ? 1 : .7 }));
}
