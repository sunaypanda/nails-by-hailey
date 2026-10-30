import { NextResponse } from "next/server";
import { z } from "zod";
import { db, errorResponse, HttpError, jsonBody, sameOrigin, throttle } from "@/lib/server";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await throttle(request, "admin-login", 8);
    const input = z.object({ email: z.string().email().max(200), password: z.string().min(1).max(200) }).parse(await jsonBody(request));
    const { data, error } = await db().auth.signInWithPassword(input);
    if (error || !data.session || !process.env.ADMIN_EMAIL || data.user?.email?.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase()) throw new HttpError("Those sign-in details could not be verified.", 401);
    const response = NextResponse.json({ ok: true });
    response.cookies.set("hailey-admin", data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: Math.min(data.session.expires_in, 3600) });
    response.headers.set("Cache-Control", "no-store"); return response;
  } catch (error) { return errorResponse(error); }
}
export async function DELETE(request: Request) {
  try { sameOrigin(request); const response = NextResponse.json({ ok: true }); response.cookies.delete("hailey-admin"); return response; }
  catch (error) { return errorResponse(error); }
}
