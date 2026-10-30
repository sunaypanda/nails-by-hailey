"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
declare global { interface Window { turnstile?: { render: (el: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void } } }
export function Captcha({ onToken, reset }: { onToken: (token: string) => void; reset: number }) {
  const el = useRef<HTMLDivElement>(null), id = useRef<string | null>(null), callback = useRef(onToken);
  const [scriptReady, setScriptReady] = useState(false);
  callback.current = onToken;
  const render = useCallback(() => {
    if (!el.current || !window.turnstile || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || id.current) return;
    id.current = window.turnstile.render(el.current, { sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, theme: "light", callback: (token: string) => callback.current(token), "expired-callback": () => callback.current(""), "error-callback": () => callback.current("") });
  }, []);
  useEffect(() => {
    if (scriptReady || window.turnstile) render();
    return () => { if (id.current && window.turnstile) window.turnstile.remove(id.current); id.current = null; };
  }, [render, reset, scriptReady]);
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return <p className="inline-note">Online forms are being prepared. Please message @pressonnailsbyhailey on Instagram for now.</p>;
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setScriptReady(true)} /><div className="captcha" ref={el} /></>;
}
