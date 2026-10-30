import "server-only";
import { cache } from "react";
import { db } from "./server";
import { defaultSettings, type Product, type Settings } from "./types";
export const getSettings = cache(async (): Promise<Settings> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return defaultSettings;
  try {
    const { data, error } = await db().from("settings").select("value").eq("id", "store").single();
    if (error) throw error;
    return { ...defaultSettings, ...data?.value };
  } catch (error) { console.error("Settings unavailable", error); return defaultSettings; }
});
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];
  try {
    const { data, error } = await db().from("products").select("*, variants(*)").eq("published", true).order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as Product[];
  } catch (error) { console.error("Catalog unavailable", error); return []; }
});
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
