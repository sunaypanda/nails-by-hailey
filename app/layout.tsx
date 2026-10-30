import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/components/store-provider";
import { Header, Footer } from "@/components/chrome";
import { siteUrl } from "@/lib/data";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "Nails by Hailey · Handmade press-ons, with lots of love", template: "%s · Nails by Hailey" },
  description: "Handmade, reusable press-on nails by Hailey Lovelady in Houston, Texas. Find your next favorite set or dream up a custom design.",
  openGraph: { type: "website", locale: "en_US", siteName: "Nails by Hailey", title: "Nails by Hailey", description: "A little detail. A lot of you. Handmade press-on nails from Houston, with lots of love.", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true }
};
export const viewport: Viewport = { themeColor: "#faf7f2", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><StoreProvider><a className="skip-link" href="#main">Skip to content</a><Header /><main id="main">{children}</main><Footer /></StoreProvider></body></html>;
}
