"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { z } from "zod";
import type { CartItem } from "@/lib/types";
const itemSchema = z.object({ variantId: z.string().uuid(), productId: z.string().uuid(), slug: z.string(), name: z.string(), image: z.string(), shape: z.string(), length: z.string(), size: z.string(), price: z.number().int().min(0), quantity: z.number().int().min(1).max(10) });
type Store = { items: CartItem[]; ready: boolean; add: (item: CartItem) => void; update: (id: string, quantity: number) => void; clear: () => void; notice: string; setNotice: (text: string) => void };
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]), [ready, setReady] = useState(false), [notice, setNotice] = useState("");
  useEffect(() => { try { const saved = z.array(itemSchema).max(30).safeParse(JSON.parse(localStorage.getItem("hailey-cart") || "[]")); if (saved.success) setItems(saved.data); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem("hailey-cart", JSON.stringify(items)); } catch {} } }, [items, ready]);
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(""), 4000); return () => clearTimeout(timer); } }, [notice]);
  const add = (item: CartItem) => { setItems(prev => { const existing = prev.find(i => i.variantId === item.variantId); return existing ? prev.map(i => i.variantId === item.variantId ? { ...i, quantity: Math.min(10, i.quantity + item.quantity) } : i) : [...prev, item]; }); setNotice(`${item.name} added to your bag`); };
  const update = (id: string, quantity: number) => setItems(prev => quantity <= 0 ? prev.filter(i => i.variantId !== id) : prev.map(i => i.variantId === id ? { ...i, quantity: Math.min(10, quantity) } : i));
  return <Context.Provider value={{ items, ready, add, update, clear: () => setItems([]), notice, setNotice }}>{children}<div className={`toast ${notice ? "visible" : ""}`} role="status">{notice}</div></Context.Provider>;
}
export function useStore() { const value = useContext(Context); if (!value) throw new Error("StoreProvider is missing"); return value; }
