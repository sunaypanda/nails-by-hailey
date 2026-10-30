import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui";
export const metadata: Metadata = { title: "Back to your bag", robots: { index: false, follow: false } };
export default function Cancel() { return <><PageIntro eyebrow="TAKE YOUR TIME" title={<>Your little bag <em>is right here.</em></>}><p>You’ve left checkout. Your bag is saved in this browser.<br />Sets reserved in an incomplete checkout become available again when that checkout expires, usually in about 31 minutes.</p></PageIntro><div className="empty-cart"><Link href="/cart" className="button button-dark">Back to your bag ↗</Link><p className="inline-note">If you saw a payment complete before arriving here, please check with Hailey before paying again.</p></div></>; }
