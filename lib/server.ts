import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { z } from "zod";

export function db() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new HttpError("The online shop is being prepared. Please reach Hailey on Instagram for now.", 503);
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export class HttpError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError) return Response.json({ error: error.issues[0]?.message || "Please check your details." }, { status: 400 });
  console.error(error instanceof Error ? error.message : "Request failed");
  return Response.json({ error: "Something went wrong. Please try again or message Hailey on Instagram." }, { status: 500 });
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) throw new HttpError("This request could not be verified.", 403);
}
export async function requireAdmin() {
  const token = (await cookies()).get("hailey-admin")?.value;
  if (!token || !process.env.ADMIN_EMAIL) throw new HttpError("Please sign in.", 401);
  const { data, error } = await db().auth.getUser(token);
  if (error || data.user?.email?.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) throw new HttpError("Please sign in again.", 401);
  return data.user;
}
export async function throttle(request: Request, scope: string, limit = 8) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new HttpError("This form is not available yet. Please message Hailey on Instagram.", 503);
  // Netlify sets x-nf-client-connection-ip; ignore caller-controlled forwarded headers.
  const ip = request.headers.get("x-nf-client-connection-ip") || "local";
  const key = createHmac("sha256", secret).update(`${scope}:${ip}`).digest("hex");
  const { data, error } = await db().rpc("check_rate_limit", { p_key: key, p_limit: limit });
  if (error) throw error;
  if (!data) throw new HttpError("Too many requests. Please try again in an hour.", 429);
}
export async function verifyCaptcha(token: string) {
  if (!process.env.TURNSTILE_SECRET_KEY) throw new HttpError("This form is not available yet. Please message Hailey on Instagram.", 503);
  const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", body: new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY, response: token }), signal: AbortSignal.timeout(10000)
  });
  const verification = await result.json();
  if (!verification.success) throw new HttpError("Please complete the security check and try again.");
}
export async function jsonBody(request: Request) {
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 64000) throw new HttpError("Your request is too large.", 413);
  try { return JSON.parse(raw); } catch { throw new HttpError("Invalid request."); }
}
export async function notify(subject: string, message: string, to?: string) {
  const recipient = to || process.env.OWNER_NOTIFICATION_EMAIL;
  if (!process.env.RESEND_API_KEY || !process.env.FROM_EMAIL || !recipient) return;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: {
    Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json"
  }, body: JSON.stringify({ from: process.env.FROM_EMAIL, to: [recipient], subject, text: message }), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Email delivery failed.");
}
