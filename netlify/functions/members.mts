// Public: the published member directory.
import { getPublished } from "../lib/store.mts";
import { json, serverError } from "../lib/http.mts";

export default async () => {
  try {
    const { list } = await getPublished();
    return json(list, { headers: { "cache-control": "public, max-age=0, must-revalidate" } });
  } catch (error) {
    return serverError((error as Error)?.message ?? "failed to load members");
  }
};

export const config = { path: "/api/members", method: ["GET"] };
