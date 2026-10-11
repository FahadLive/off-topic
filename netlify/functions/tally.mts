// Public: receives Tally form submissions and queues them for review.
// Configure this URL as a Tally webhook (Form settings -> Integrations -> Webhooks).
import { mutatePending } from "../lib/store.mts";
import { normalizeMember } from "../lib/member.mts";
import { parseTallyWebhook, verifyTallySignature } from "../lib/tally.mts";
import { json, unauthorized, serverError } from "../lib/http.mts";

export default async (req: Request) => {
  try {
    const rawBody = await req.text();
    if (!(await verifyTallySignature(req, rawBody))) return unauthorized();

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return json({ error: "invalid json" }, { status: 400 });
    }

    const parsed = parseTallyWebhook(payload);
    const member = normalizeMember(parsed.fields, String(parsed.fields.name ?? ""));

    await mutatePending((list) => {
      if (list.some((item) => item.submissionId === parsed.submissionId)) {
        return { next: list, result: null };
      }
      return {
        next: [
          ...list,
          {
            submissionId: parsed.submissionId,
            submittedAt: parsed.submittedAt,
            source: "tally" as const,
            member,
          },
        ],
        result: null,
      };
    });

    return json({ ok: true, submissionId: parsed.submissionId });
  } catch (error) {
    return serverError((error as Error)?.message ?? "failed to queue submission");
  }
};

export const config = { path: "/api/tally", method: ["POST"] };
