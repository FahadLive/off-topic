// Password-gated admin sessions.
//
// There is a single shared password (ADMIN_PASSWORD). A successful login mints
// a signed, expiring token stored in an HttpOnly cookie. The token is signed
// with ADMIN_SESSION_SECRET (falling back to ADMIN_PASSWORD), so no database is
// needed to track sessions.
//
// This is intentionally simple: two trusted curators, one shared password.

import { parseCookies } from "./http.mts";

export const SESSION_COOKIE = "ot_admin";
const DEFAULT_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signingSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkPassword(candidate: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof candidate !== "string" || candidate.length === 0) {
    return false;
  }
  return safeEqual(candidate, expected);
}

export async function createSessionToken(ttlMs = DEFAULT_TTL_MS): Promise<string> {
  const expires = Date.now() + ttlMs;
  const payload = `v1.${expires}`;
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [version, expires, signature] = parts;
  if (version !== "v1") return false;
  const expected = await sign(`${version}.${expires}`);
  if (!safeEqual(signature, expected)) return false;
  const expiry = Number(expires);
  return Number.isFinite(expiry) && expiry > Date.now();
}

function cookieAttrs(secure: boolean): string {
  return ["Path=/", "HttpOnly", "SameSite=Lax", secure ? "Secure" : ""].filter(Boolean).join("; ");
}

export function sessionCookie(token: string, secure: boolean): string {
  const maxAge = Math.floor(DEFAULT_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${token}; Max-Age=${maxAge}; ${cookieAttrs(secure)}`;
}

export function clearSessionCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; Max-Age=0; ${cookieAttrs(secure)}`;
}

export async function isAuthenticated(req: Request): Promise<boolean> {
  return verifySessionToken(parseCookies(req)[SESSION_COOKIE]);
}
