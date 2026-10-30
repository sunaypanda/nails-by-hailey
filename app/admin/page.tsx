import type { Metadata } from "next";
import { Admin } from "@/components/admin";
export const metadata: Metadata = { title: "Owner studio", robots: { index: false, follow: false } };
export default function AdminPage() { return <Admin />; }
