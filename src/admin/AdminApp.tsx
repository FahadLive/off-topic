import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Member, PendingSubmission } from "../types/data";
import { api, emptyMember, type AdminData } from "./api";
import { MemberForm } from "./MemberForm";

function useAutoDarkMode() {
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
}

const card =
  "rounded-2xl border-2 border-[#1b66f3]/20 bg-white dark:bg-gray-800 p-5 shadow-lg";
const primaryBtn =
  "rounded-lg bg-[#1b66f3] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1b66f3]/90 disabled:opacity-50";
const ghostBtn =
  "rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50";
const dangerBtn =
  "rounded-lg border border-red-300 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50";

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(password);
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <form onSubmit={submit} className={`${card} w-full max-w-sm`}>
        <h1 className="mb-1 text-xl font-black text-gray-900 dark:text-white">off-topic admin</h1>
        <p className="mb-4 font-mono text-xs text-gray-500 dark:text-gray-400">
          Enter the shared admin password.
        </p>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1b66f3] focus:ring-2 focus:ring-[#1b66f3]/20 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        />
        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}
        <button type="submit" disabled={busy || !password} className={`${primaryBtn} w-full`}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

interface PendingCardProps {
  item: PendingSubmission;
  onChanged: (message: string) => void;
}

function PendingCard({ item, onChanged }: PendingCardProps) {
  const [draft, setDraft] = useState<Member>(item.member);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>, message: string) {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged(message);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {draft.image && (
            <img
              src={draft.image}
              alt=""
              className="h-12 w-12 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{draft.name || "Unnamed"}</p>
            <p className="font-mono text-[11px] text-gray-400">
              {item.source === "tally" ? "Tally" : "Manual"} ·{" "}
              {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : "unknown time"}
            </p>
          </div>
        </div>
      </div>

      <MemberForm value={draft} onChange={setDraft} />

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          disabled={busy}
          className={primaryBtn}
          onClick={() => run(() => api.approve(item.submissionId, draft), "Published to the directory")}
        >
          Approve &amp; publish
        </button>
        <button
          disabled={busy}
          className={ghostBtn}
          onClick={() => run(() => api.updatePending(item.submissionId, draft), "Draft saved")}
        >
          Save changes
        </button>
        <button
          disabled={busy}
          className={dangerBtn}
          onClick={() => {
            if (confirm(`Reject ${draft.name || "this submission"}? This can't be undone.`)) {
              run(() => api.reject(item.submissionId), "Submission rejected");
            }
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
}

interface PublishedRowProps {
  member: Member;
  onChanged: (message: string) => void;
}

function PublishedRow({ member, onChanged }: PublishedRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Member>(member);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.save(draft);
      setEditing(false);
      onChanged("Member updated");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <div className="flex items-center gap-3">
        {member.image && (
          <img
            src={member.image}
            alt=""
            className="h-12 w-12 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-gray-900 dark:text-white">{member.name}</p>
          <p className="truncate font-mono text-[11px] text-gray-400">
            {member.id} · {member.major || "—"} · {member.passoutYear || "—"}
          </p>
        </div>
        <button className={ghostBtn} onClick={() => setEditing((v) => !v)}>
          {editing ? "Close" : "Edit"}
        </button>
        <button
          className={dangerBtn}
          onClick={() => {
            if (confirm(`Delete ${member.name}? This can't be undone.`)) {
              api.remove(member.id).then(() => onChanged("Member deleted")).catch((err) => setError(err.message));
            }
          }}
        >
          Delete
        </button>
      </div>

      {editing && (
        <div className="mt-4 border-t border-dashed border-gray-200 pt-4 dark:border-gray-700">
          <MemberForm value={draft} onChange={setDraft} />
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
          <div className="mt-4 flex gap-2">
            <button disabled={busy} className={primaryBtn} onClick={save}>
              Save
            </button>
            <button
              disabled={busy}
              className={ghostBtn}
              onClick={() => {
                setDraft(member);
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface ImportPanelProps {
  onChanged: (message: string) => void;
}

function ImportPanel({ onChanged }: ImportPanelProps) {
  const [replace, setReplace] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const parsed = JSON.parse(await file.text());
      const members: Member[] = Array.isArray(parsed) ? parsed : (parsed.members ?? []);
      if (!Array.isArray(members) || members.length === 0) {
        throw new Error("No members found in that file");
      }
      const result = await api.importMembers(members, replace);
      onChanged(
        `Imported ${result.total} members` +
          (result.replaced != null ? ` (replaced ${result.replaced})` : ""),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={card}>
      <h3 className="mb-1 font-bold text-gray-900 dark:text-white">Import members.json</h3>
      <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
        Seed or bulk-load the directory from a JSON file (an exported array, or{" "}
        <code>{"{ \"members\": [...] }"}</code>).
      </p>
      <label className="mb-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
        <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} />
        Replace the entire published list (uncheck to merge/update by id)
      </label>
      <input
        type="file"
        accept="application/json,.json"
        disabled={busy}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:rounded-md file:border-0 file:bg-[#1b66f3] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
      />
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function AdminApp() {
  useAutoDarkMode();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<"pending" | "published">("pending");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newMember, setNewMember] = useState<Member | null>(null);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    const next = await api.getData();
    setData(next);
  }, []);

  useEffect(() => {
    refresh()
      .then(() => setAuthed(true))
      .catch((err) => {
        if ((err as any).status !== 401) setError((err as Error).message);
        setAuthed(false);
      });
  }, [refresh]);

  const flash = useCallback(
    (message: string) => {
      setNotice(message);
      refresh().catch(() => {});
      window.setTimeout(() => setNotice(null), 2500);
    },
    [refresh],
  );

  const filteredPublished = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.published;
    return data.published.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.major.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q),
    );
  }, [data, search]);

  if (authed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    );
  }

  if (!authed) {
    return (
      <>
        <Login
          onSuccess={() => {
            setError(null);
            refresh()
              .then(() => setAuthed(true))
              .catch((err) => setError((err as Error).message));
          }}
        />
      </>
    );
  }

  const pending = data?.pending ?? [];
  const published = data?.published ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <header className="border-b border-[#1b66f3]/10 bg-white/70 backdrop-blur dark:bg-gray-900/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white">off-topic admin</h1>
            <p className="font-mono text-[11px] text-gray-400">
              {published.length} published · {pending.length} pending
            </p>
          </div>
          <button
            className={ghostBtn}
            onClick={() => api.logout().then(() => window.location.reload())}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab("pending")}
            className={`${tab === "pending" ? primaryBtn : ghostBtn}`}
          >
            Pending ({pending.length})
          </button>
          <button
            onClick={() => setTab("published")}
            className={`${tab === "published" ? primaryBtn : ghostBtn}`}
          >
            Published ({published.length})
          </button>
        </div>

        {tab === "pending" && (
          <div className="flex flex-col gap-5">
            {pending.length === 0 ? (
              <div className={card}>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No submissions waiting. New Tally responses land here automatically.
                </p>
              </div>
            ) : (
              [...pending]
                .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""))
                .map((item) => (
                  <PendingCard key={item.submissionId} item={item} onChanged={flash} />
                ))
            )}
          </div>
        )}

        {tab === "published" && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members…"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#1b66f3] dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              />
              <button className={primaryBtn} onClick={() => setNewMember(emptyMember())}>
                + Add member
              </button>
            </div>

            {newMember && (
              <div className={card}>
                <h3 className="mb-4 font-bold text-gray-900 dark:text-white">New member</h3>
                <MemberForm value={newMember} onChange={setNewMember} />
                <div className="mt-4 flex gap-2">
                  <button
                    className={primaryBtn}
                    disabled={!newMember.name}
                    onClick={() =>
                      api
                        .save(newMember)
                        .then(() => {
                          setNewMember(null);
                          flash("Member added");
                        })
                        .catch((err) => setError((err as Error).message))
                    }
                  >
                    Save
                  </button>
                  <button className={ghostBtn} onClick={() => setNewMember(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <ImportPanel onChanged={flash} />

            {filteredPublished.map((member) => (
              <PublishedRow key={member.id} member={member} onChanged={flash} />
            ))}
          </div>
        )}
      </main>

      {notice && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-gray-900">
          {notice}
        </div>
      )}
    </div>
  );
}
