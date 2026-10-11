// Normalization helpers: turn messy form input into the shape the site expects.

import type { Member } from "./types.mts";

// Pastel accents already used across the site, so auto-assigned colors blend in.
const PALETTE = [
  "#FFB6C1", "#B6D4FF", "#C8F7C5", "#FFD700", "#FFA07A", "#DDA0DD", "#87CEEB",
  "#98FB98", "#FFDAB9", "#E6E6FA", "#F0E68C", "#FFB347", "#B0E0E6", "#D8BFD8",
  "#FFDEAD", "#AFEEEE", "#FFE4E1", "#C1FFC1", "#E0BBE4", "#B0C4DE", "#F5DEB3",
  "#E1F7D5", "#FFFACD", "#B2DFDB", "#FFC0CB",
];

export function slugify(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Accepts a full profile URL, an @handle, or a bare handle and returns the handle. */
export function handleFromUrl(input: unknown): string {
  if (input == null) return "";
  let value = String(input).trim();
  if (!value) return "";

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "");
      const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
      if (host.endsWith("linkedin.com")) {
        const idx = parts.indexOf("in");
        if (idx !== -1 && parts[idx + 1]) return parts[idx + 1];
      }
      return parts[0] ?? "";
    } catch {
      // fall through to the plain-text handling below
    }
  }

  return value.replace(/^@+/, "").replace(/^\/+/, "").split(/[/?#]/)[0].trim();
}

export function normalizeInterests(value: unknown): string {
  return String(value ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export function pickColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

export function normalizeMember(input: Record<string, unknown>, fallbackId?: string): Member {
  const name = String(input.name ?? "").trim() || "Unnamed";
  const id = slugify(fallbackId ?? input.id ?? name) || `member-${Date.now()}`;
  const year = Number(String(input.passoutYear ?? "").replace(/[^0-9]/g, ""));
  return {
    id,
    name,
    passoutYear: Number.isFinite(year) ? year : 0,
    major: String(input.major ?? "").trim(),
    role: String(input.role ?? "").trim(),
    interests: normalizeInterests(input.interests),
    color: /^#[0-9a-fA-F]{3,8}$/.test(String(input.color ?? ""))
      ? String(input.color)
      : pickColor(name),
    image: String(input.image ?? "").trim(),
    bio: String(input.bio ?? "").trim(),
    github: handleFromUrl(input.github),
    linkedin: handleFromUrl(input.linkedin),
    twitter: handleFromUrl(input.twitter),
    instagram: handleFromUrl(input.instagram),
    vouchedBy: String(input.vouchedBy ?? "").trim(),
  };
}

/** Returns `base`, or `base-2`, `base-3`, ... until it is not in `usedIds`. */
export function ensureUniqueId(base: string, usedIds: Set<string>): string {
  const root = slugify(base) || `member-${Date.now()}`;
  if (!usedIds.has(root)) return root;
  let n = 2;
  while (usedIds.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}
