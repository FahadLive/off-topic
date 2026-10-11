// Admin login/logout. Mints or clears the signed session cookie.
import {
  checkPassword,
  clearSessionCookie,
  createSessionToken,
  isConfigured,
  sessionCookie,
} from "../lib/auth.mts";
import { isSecureRequest, json, serverError } from "../lib/http.mts";

export default async (req: Request) => {
  try {
    const secure = isSecureRequest(req);
    const path = new URL(req.url).pathname;

    if (path.endsWith("/logout")) {
      return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie(secure) } });
    }

    if (!isConfigured()) {
      return json({ error: "ADMIN_PASSWORD is not configured on the server" }, { status: 500 });
    }

    let body: { password?: unknown } = {};
    try {
      body = await req.json();
    } catch {
      // ignore malformed body, password check will fail
    }

    if (!checkPassword(body.password)) {
      return json({ error: "invalid password" }, { status: 401 });
    }

    const token = await createSessionToken();
    return json({ ok: true }, { headers: { "set-cookie": sessionCookie(token, secure) } });
  } catch (error) {
    return serverError((error as Error)?.message ?? "login failed");
  }
};

export const config = { path: ["/api/login", "/api/logout"], method: ["POST"] };
