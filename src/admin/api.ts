import type { Member, PendingSubmission } from "../types/data";

export type AdminData = {
  published: Member[];
  pending: PendingSubmission[];
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: "include",
    headers: init.body ? { "content-type": "application/json" } : undefined,
    ...init,
  });

  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    (error as any).status = res.status;
    throw error;
  }
  return data as T;
}

export const api = {
  login: (password: string) =>
    request<{ ok: true }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  logout: () => request<{ ok: true }>("/api/logout", { method: "POST" }),
  getData: () => request<AdminData>("/api/admin/data"),
  save: (member: Member) =>
    request<{ member: Member }>("/api/admin/save", {
      method: "POST",
      body: JSON.stringify({ member }),
    }),
  remove: (id: string) =>
    request<{ removed: number }>("/api/admin/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
  approve: (submissionId: string, member: Member) =>
    request<{ member: Member }>("/api/admin/approve", {
      method: "POST",
      body: JSON.stringify({ submissionId, member }),
    }),
  reject: (submissionId: string) =>
    request<{ removed: number }>("/api/admin/reject", {
      method: "POST",
      body: JSON.stringify({ submissionId }),
    }),
  updatePending: (submissionId: string, member: Member) =>
    request<{ member: Member }>("/api/admin/update-pending", {
      method: "POST",
      body: JSON.stringify({ submissionId, member }),
    }),
  importMembers: (members: Member[], replace: boolean) =>
    request<{ added: number; updated?: number; total: number; replaced?: number }>(
      "/api/admin/import",
      { method: "POST", body: JSON.stringify({ members, replace }) },
    ),
  upload: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "upload failed");
    return data as { url: string };
  },
};

export const emptyMember = (): Member => ({
  id: "",
  name: "",
  passoutYear: new Date().getFullYear(),
  major: "",
  role: "Student",
  interests: "",
  color: "#FFB6C1",
  image: "",
  bio: "",
  github: "",
  linkedin: "",
  twitter: "",
  instagram: "",
  vouchedBy: "",
});
