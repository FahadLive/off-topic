// Small helpers shared by the functions. Kept dependency-free so the same code
// runs on the Netlify Node runtime and in local `netlify dev`.

export function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

export function badRequest(message: string, status = 400): Response {
  return json({ error: message }, { status });
}

export function unauthorized(): Response {
  return json({ error: "unauthorized" }, { status: 401 });
}

export function serverError(message = "internal error"): Response {
  return json({ error: message }, { status: 500 });
}

export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.get("cookie") ?? "";
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    out[name] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

export function isSecureRequest(req: Request): boolean {
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}
