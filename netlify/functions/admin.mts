// Authenticated admin actions. Routed at /api/admin/:action.
import { isAuthenticated } from "../lib/auth.mts";
import { getPending, getPublished, mutatePending, mutatePublished } from "../lib/store.mts";
import { ensureUniqueId, normalizeMember } from "../lib/member.mts";
import { badRequest, json, serverError, unauthorized } from "../lib/http.mts";
import type { Member } from "../lib/types.mts";

/** Adds a member, or replaces the existing one when `fallbackId` matches. */
async function publishMember(
  input: Record<string, unknown>,
  fallbackId?: string,
): Promise<Member> {
  return mutatePublished((list) => {
    const usedIds = new Set(list.map((m) => m.id));
    const incoming = normalizeMember(input, fallbackId ?? (input.id as string));
    const existingIndex = fallbackId ? list.findIndex((m) => m.id === fallbackId) : -1;
    const id = existingIndex === -1 ? ensureUniqueId(incoming.id, usedIds) : incoming.id;
    const nextMember: Member = { ...incoming, id };
    const next =
      existingIndex === -1
        ? [...list, nextMember]
        : list.map((m, i) => (i === existingIndex ? nextMember : m));
    return { next, result: nextMember };
  });
}

export default async (req: Request, context: { params: Record<string, string> }) => {
  try {
    if (!(await isAuthenticated(req))) return unauthorized();

    const action = context.params.action;

    if (action === "data") {
      const [published, pending] = await Promise.all([getPublished(), getPending()]);
      return json({ published: published.list, pending: pending.list });
    }

    let body: any = {};
    if (req.method !== "GET") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    switch (action) {
      case "save": {
        const raw = body.member ?? {};
        const member = await publishMember(raw, raw.id);
        return json({ member });
      }

      case "delete": {
        const id = String(body.id ?? "");
        if (!id) return badRequest("id is required");
        const removed = await mutatePublished((list) => {
          const next = list.filter((m) => m.id !== id);
          return { next, result: list.length - next.length };
        });
        return json({ removed });
      }

      case "approve": {
        const submissionId = String(body.submissionId ?? "");
        if (!submissionId) return badRequest("submissionId is required");
        const { list } = await getPending();
        const item = list.find((p) => p.submissionId === submissionId);
        const merged = { ...(item?.member ?? {}), ...(body.member ?? {}) };
        const member = await publishMember(merged, body.member?.id ?? item?.member.id);
        await mutatePending((pending) => ({
          next: pending.filter((p) => p.submissionId !== submissionId),
          result: null,
        }));
        return json({ member });
      }

      case "reject": {
        const submissionId = String(body.submissionId ?? "");
        if (!submissionId) return badRequest("submissionId is required");
        const removed = await mutatePending((pending) => {
          const next = pending.filter((p) => p.submissionId !== submissionId);
          return { next, result: pending.length - next.length };
        });
        return json({ removed });
      }

      case "update-pending": {
        const submissionId = String(body.submissionId ?? "");
        if (!submissionId) return badRequest("submissionId is required");
        const member = normalizeMember({ ...(body.member ?? {}) }, body.member?.id);
        const updated = await mutatePending((pending) => ({
          next: pending.map((p) => (p.submissionId === submissionId ? { ...p, member } : p)),
          result: member,
        }));
        return json({ member: updated });
      }

      case "import": {
        const members: any[] = Array.isArray(body.members) ? body.members : [];
        const replace = Boolean(body.replace);
        type ImportResult = { added: number; replaced?: number; updated?: number; total: number };
        const result = await mutatePublished<ImportResult>((list) => {
          if (replace) {
            const used = new Set<string>();
            const next = members.map((raw) => {
              const m = normalizeMember(raw ?? {}, raw?.id ?? raw?.name);
              const id = ensureUniqueId(m.id, used);
              used.add(id);
              return { ...m, id };
            });
            return { next, result: { added: next.length, replaced: list.length, total: next.length } };
          }
          const byId = new Map(list.map((m) => [m.id, m]));
          let added = 0;
          let updated = 0;
          for (const raw of members) {
            const m = normalizeMember(raw ?? {}, raw?.id ?? raw?.name);
            if (byId.has(m.id)) {
              byId.set(m.id, { ...byId.get(m.id)!, ...m });
              updated++;
            } else {
              byId.set(m.id, m);
              added++;
            }
          }
          const next = [...byId.values()];
          return { next, result: { added, updated, total: next.length } };
        });
        return json(result);
      }

      default:
        return badRequest(`unknown action: ${action}`, 404);
    }
  } catch (error) {
    return serverError((error as Error)?.message ?? "admin action failed");
  }
};

export const config = { path: "/api/admin/:action", method: ["GET", "POST"] };
