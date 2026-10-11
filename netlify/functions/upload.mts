// Admin-only: stores an uploaded member photo in Netlify Blobs.
import { isAuthenticated } from "../lib/auth.mts";
import { store } from "../lib/store.mts";
import { badRequest, json, serverError, unauthorized } from "../lib/http.mts";

const MAX_BYTES = 4 * 1024 * 1024; // functions cap binary payloads around 4.5 MB

export default async (req: Request) => {
  try {
    if (!(await isAuthenticated(req))) return unauthorized();

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return badRequest("no file provided");
    if (file.size > MAX_BYTES) return badRequest("file too large (max 4 MB)");
    if (!file.type.startsWith("image/")) return badRequest("only image uploads are allowed");

    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const key = `uploads/${crypto.randomUUID()}.${ext}`;

    await store().set(key, await file.arrayBuffer(), {
      metadata: { contentType: file.type },
    });

    return json({ url: `/api/image/${key}` });
  } catch (error) {
    return serverError((error as Error)?.message ?? "upload failed");
  }
};

export const config = { path: "/api/upload", method: ["POST"] };
