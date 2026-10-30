import { randomUUID } from "node:crypto";
import { errorResponse, HttpError, requireAdmin, sameOrigin } from "@/lib/server";
import { limitedForm, uploadPhoto } from "@/lib/uploads";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    sameOrigin(request); await requireAdmin(); const form = await limitedForm(request), file = form.get("photo");
    if (!(file instanceof File)) throw new HttpError("Choose a photo to upload.");
    return Response.json(await uploadPhoto(file, "product-photos", randomUUID()));
  } catch (error) { return errorResponse(error); }
}
