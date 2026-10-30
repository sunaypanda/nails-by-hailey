import { createHash, randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import { db, errorResponse, HttpError, notify, sameOrigin, throttle, verifyCaptcha } from "@/lib/server";
import { limitedForm, uploadPhoto } from "@/lib/uploads";
import { siteUrl } from "@/lib/data";
export const runtime = "nodejs";
const schema = z.object({
  kind: z.enum(["contact", "custom"]), name: z.string().trim().min(1, "Please enter your name.").max(100), email: z.string().trim().email("Please enter a valid email.").max(200), instagram: z.string().max(100), notes: z.string().max(3000),
  shape: z.enum(["", "Almond", "Square", "Coffin", "Help me choose"]), length: z.enum(["", "Short", "Medium", "Help me choose"]), size: z.enum(["", "XS", "S", "M", "L", "Custom measurements", "I need sizing help"]), measurements: z.string().max(500), colors: z.string().max(300), style: z.enum(["", "Solid color", "French tips", "Simple nail art", "Detailed nail art", "Luxury / 3D", "Seasonal / themed", "Help me decide"]), charms: z.enum(["", "None", "1–2 charms", "3 or more charms"]), requested_date: z.string().max(10)
}).superRefine((data, ctx) => {
  if (data.kind === "contact" && !data.notes.trim()) ctx.addIssue({ code: "custom", message: "Please add a message." });
  if (data.kind === "custom" && [data.shape, data.length, data.size, data.colors.trim(), data.style, data.charms].some(x => !x)) ctx.addIssue({ code: "custom", message: "Please complete your design choices." });
  if (data.size === "Custom measurements" && !data.measurements.trim()) ctx.addIssue({ code: "custom", message: "Please share all ten nail measurements." });
  if (data.requested_date) {
    const date = new Date(`${data.requested_date}T12:00:00Z`), today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.requested_date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.requested_date || data.requested_date < today) ctx.addIssue({ code: "custom", message: "Choose a valid date today or later. Availability is confirmed by Hailey." });
  }
});
export async function POST(request: Request) {
  const uploaded: string[] = []; let saved = false;
  try {
    sameOrigin(request); await throttle(request, "inquiry", 6);
    const form = await limitedForm(request);
    if (form.get("website")) throw new HttpError("Your submission could not be accepted.");
    await verifyCaptcha(String(form.get("captcha") || ""));
    const fields = Object.fromEntries(["kind", "name", "email", "instagram", "notes", "shape", "length", "size", "measurements", "colors", "style", "charms", "requested_date"].map(key => [key, String(form.get(key) || "")]));
    const data = schema.parse(fields), files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length > 3 || files.reduce((n, f) => n + f.size, 0) > 3 * 1024 * 1024 || data.kind === "contact" && files.length) throw new HttpError("Choose up to 3 photos, under 3 MB in total.");
    const id = randomUUID(), reference = `NBH-${randomBytes(6).toString("hex").toUpperCase()}`, token = randomBytes(24).toString("base64url");
    for (const file of files) { const photo = await uploadPhoto(file, "inquiry-photos", id); uploaded.push(photo.path); }
    const { error } = await db().from("inquiries").insert({ id, reference, token_hash: createHash("sha256").update(token).digest("hex"), kind: data.kind, name: data.name, email: data.email.toLowerCase(), details: data, photos: uploaded, status: "received" });
    if (error) throw error;
    saved = true;
    const link = `${siteUrl()}/track?ref=${reference}#${token}`;
    await Promise.allSettled([
      notify(`New ${data.kind === "custom" ? "custom nail request" : "message"}: ${reference}`, `${data.name} has sent a ${data.kind} inquiry. Sign in to ${siteUrl()}/admin to view the details. Reference: ${reference}`),
      notify(data.kind === "custom" ? "Your ideas are with Hailey ♡" : "Your note is with Hailey ♡", `Hi ${data.name},\n\nThanks for your ${data.kind === "custom" ? "custom-design ideas" : "message"}! Your reference is ${reference}.\n\n${data.kind === "custom" ? `Save your private tracking link: ${link}\n\nThis is an inquiry, not a paid order. Hailey will confirm design, pricing, and availability before any purchase.\n\n` : ""}With lots of love,\nHailey`, data.email)
    ]);
    return Response.json(data.kind === "custom" ? { reference, token } : { ok: true }, { status: 201 });
  } catch (error) {
    if (!saved && uploaded.length) await db().storage.from("inquiry-photos").remove(uploaded).catch(() => undefined);
    return errorResponse(error);
  }
}
