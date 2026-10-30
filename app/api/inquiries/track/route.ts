import { createHash } from "node:crypto";
import { z } from "zod";
import { db, errorResponse, HttpError, jsonBody, sameOrigin, throttle } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await throttle(request, "tracking", 30);
    const { reference, token } = z.object({ reference: z.string().regex(/^NBH-[A-F0-9]{12}$/), token: z.string().regex(/^[A-Za-z0-9_-]{32}$/) }).parse(await jsonBody(request));
    const { data, error } = await db().from("inquiries").select("reference,status,created_at").eq("reference", reference).eq("kind", "custom").eq("token_hash", createHash("sha256").update(token).digest("hex")).maybeSingle();
    if (error) throw error; if (!data) throw new HttpError("That reference and private token don’t match. Please use the saved link, or contact Hailey.", 404);
    return Response.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return errorResponse(error); }
}
