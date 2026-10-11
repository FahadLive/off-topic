// Public: streams a stored member photo. Keys look like uploads/<uuid>.<ext>.
import { store } from "../lib/store.mts";

export default async (_req: Request, context: { params: Record<string, string> }) => {
  const { folder, file } = context.params;
  const entry = await store().getWithMetadata(`${folder}/${file}`, { type: "blob" });

  if (!entry) return new Response("Not found", { status: 404 });

  const contentType =
    (entry.metadata?.contentType as string | undefined) ?? entry.data.type ?? "application/octet-stream";

  return new Response(entry.data, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

export const config = { path: "/api/image/:folder/:file", method: ["GET"] };
