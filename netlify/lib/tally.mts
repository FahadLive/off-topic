// Parses a Tally form-response webhook into member fields.
//
// Tally sends { eventId, eventType, data: { submissionId, createdAt, fields: [...] } }
// where each field has { key, label, type, value }. File uploads arrive as an
// array of { url, name, mimeType, size }. Exported upload URLs already carry an
// access token, so they work without a Tally login.

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/\s+/g, " ").replace(/[:*]+$/, "").trim();
}

function pickLabel(map: Map<string, string>, candidates: string[]): string {
  for (const candidate of candidates) {
    const hit = map.get(candidate);
    if (hit) return hit;
  }
  return "";
}

export type ParsedTally = {
  submissionId: string;
  submittedAt: string;
  fields: Record<string, unknown>;
};

export function parseTallyWebhook(payload: any): ParsedTally {
  const data = payload?.data ?? payload ?? {};
  const rawFields: any[] = Array.isArray(data.fields) ? data.fields : [];

  const byLabel = new Map<string, string>();
  let image = "";

  for (const field of rawFields) {
    const value = field?.value;
    if (Array.isArray(value)) {
      const first = value[0];
      if (first && typeof first === "object" && typeof first.url === "string") {
        image = image || first.url;
        continue;
      }
    }
    if (typeof value === "string" || typeof value === "number") {
      byLabel.set(normalizeLabel(String(field?.label ?? "")), String(value));
    }
  }

  return {
    submissionId: String(data.submissionId ?? payload?.eventId ?? crypto.randomUUID()),
    submittedAt: String(data.createdAt ?? payload?.createdAt ?? new Date().toISOString()),
    fields: {
      name: pickLabel(byLabel, ["full name", "name"]),
      major: pickLabel(byLabel, [
        "branch/department",
        "department/branch",
        "branch / department",
        "branch",
        "department",
        "major",
      ]),
      passoutYear: pickLabel(byLabel, ["passout year", "pass out year", "graduation year"]),
      role: pickLabel(byLabel, ["role/title", "role", "title"]),
      bio: pickLabel(byLabel, ["bio"]),
      interests: pickLabel(byLabel, ["interests"]),
      linkedin: pickLabel(byLabel, ["linkedin profile url", "linkedin"]),
      github: pickLabel(byLabel, ["github profile url", "github"]),
      twitter: pickLabel(byLabel, ["twitter/x profile url", "twitter/x profile", "twitter", "x profile url"]),
      instagram: pickLabel(byLabel, ["instagram profile url", "instagram"]),
      image,
    },
  };
}

/** Verifies the `Tally-Signature` header when a signing secret is configured. */
export async function verifyTallySignature(req: Request, rawBody: string): Promise<boolean> {
  const secret = process.env.TALLY_SIGNING_SECRET;
  if (!secret) return true; // verification disabled
  const provided = req.headers.get("tally-signature");
  if (!provided) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody)),
  );
  let binary = "";
  for (const b of digest) binary += String.fromCharCode(b);
  const base64 = btoa(binary);
  const hex = [...digest].map((b) => b.toString(16).padStart(2, "0")).join("");

  return provided === base64 || provided === hex;
}
