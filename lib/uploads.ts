import "server-only";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { db, HttpError } from "./server";
export function validateImageUrl(value: string) {
  if (!value) return;
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!base || !value.startsWith(`${base}/storage/v1/object/public/product-photos/`)) throw new HttpError("Use photos uploaded through this dashboard.");
}
export async function uploadPhoto(file: File, bucket: "product-photos" | "inquiry-photos", folder: string) {
  if (!file.size || file.size > 3 * 1024 * 1024) throw new HttpError("Each photo must be under 3 MB.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new HttpError("Please use JPG, PNG, or WebP photos.");
  const input = Buffer.from(await file.arrayBuffer());
  const image = sharp(input, { limitInputPixels: 25000000, failOn: "warning" });
  let output: Buffer;
  try {
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) throw new Error("Unsupported image");
    // Re-encoding validates content, drops metadata, and prevents executable uploads.
    output = await image.rotate().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
  } catch { throw new HttpError("That photo could not be read. Please choose a valid JPG, PNG, or WebP image."); }
  const path = `${folder}/${randomUUID()}.webp`;
  const { error } = await db().storage.from(bucket).upload(path, output, { contentType: "image/webp", upsert: false });
  if (error) throw error;
  return { path, url: db().storage.from(bucket).getPublicUrl(path).data.publicUrl };
}
export async function limitedForm(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError("Missing form data.");
  const chunks: Uint8Array[] = []; let length = 0;
  while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > 3.5 * 1024 * 1024) { await reader.cancel(); throw new HttpError("Please keep your photos under 3 MB in total.", 413); } chunks.push(value); }
  const body = Buffer.concat(chunks);
  try { return await new Response(body, { headers: { "Content-Type": request.headers.get("content-type") || "" } }).formData(); }
  catch { throw new HttpError("The form could not be read."); }
}
