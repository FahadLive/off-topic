// Netlify Blobs access. We keep two JSON lists in one store:
//   members -> published members (public read via /api/members)
//   pending -> submissions awaiting review (admin only)
//
// Writes use ETag-based optimistic concurrency (onlyIfMatch), so two curators
// editing at the same time cannot silently clobber each other.

import { getStore } from "@netlify/blobs";
import type { Member, PendingItem } from "./types.mts";

const STORE_NAME = "off-topic";
export const PUBLISHED_KEY = "members";
export const PENDING_KEY = "pending";

export function store() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

type ListResult<T> = { list: T[]; etag: string | null };
type Updater<T, R> = (list: T[]) => Promise<{ next: T[]; result: R }> | { next: T[]; result: R };

async function readList<T>(key: string): Promise<ListResult<T>> {
  const entry = await store().getWithMetadata(key, { type: "json" });
  if (!entry) return { list: [], etag: null };
  return {
    list: Array.isArray(entry.data) ? (entry.data as T[]) : [],
    etag: entry.etag ?? null,
  };
}

async function mutateList<T, R>(key: string, updater: Updater<T, R>): Promise<R> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const { list, etag } = await readList<T>(key);
    const { next, result } = await updater(list);

    // No-op changes (e.g. re-saving an unchanged member, or a duplicate
    // webhook delivery) would otherwise be retried forever, because a write
    // with identical content reports no modification.
    if (JSON.stringify(next) === JSON.stringify(list)) return result;

    const write = await store().setJSON(
      key,
      next,
      etag ? { onlyIfMatch: etag } : undefined,
    );
    if (write.modified) return result;
  }
  throw new Error("conflict: the data changed while saving, please retry");
}

export function getPublished(): Promise<ListResult<Member>> {
  return readList<Member>(PUBLISHED_KEY);
}

export function getPending(): Promise<ListResult<PendingItem>> {
  return readList<PendingItem>(PENDING_KEY);
}

export function mutatePublished<R>(updater: Updater<Member, R>): Promise<R> {
  return mutateList<Member, R>(PUBLISHED_KEY, updater);
}

export function mutatePending<R>(updater: Updater<PendingItem, R>): Promise<R> {
  return mutateList<PendingItem, R>(PENDING_KEY, updater);
}
