import { Suspense } from "react";
import type { Metadata } from "next";
import { PageIntro } from "@/components/ui";
import { Tracking } from "@/components/tracking";
export const metadata: Metadata = { title: "Track your custom request", robots: { index: false, follow: false } };
export default function TrackPage() { return <><PageIntro eyebrow="YOUR IDEA IS IN GOOD HANDS" title={<>Your little <em>work in progress.</em></>}><p>Check the status of your custom-design inquiry.<br />You’ll need the private link saved when you submitted it.</p></PageIntro><div className="container page-content"><Suspense fallback={<p>Loading your request…</p>}><Tracking /></Suspense></div></>; }
