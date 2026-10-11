import { useState, type ReactNode } from "react";
import type { Member } from "../types/data";
import { api } from "./api";

const PALETTE = [
  "#FFB6C1", "#B6D4FF", "#C8F7C5", "#FFD700", "#FFA07A", "#DDA0DD", "#87CEEB",
  "#98FB98", "#FFDAB9", "#E6E6FA", "#F0E68C", "#FFB347", "#B0E0E6", "#D8BFD8",
  "#FFDEAD", "#AFEEEE", "#FFE4E1", "#C1FFC1", "#E0BBE4", "#B0C4DE", "#F5DEB3",
  "#E1F7D5", "#FFFACD", "#B2DFDB", "#FFC0CB",
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[2px] text-[#1b66f3]">
        {label}
      </span>
      {children}
      {hint && <span className="text-[11px] text-gray-400 dark:text-gray-500">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-[#1b66f3] focus:ring-2 focus:ring-[#1b66f3]/20";

interface MemberFormProps {
  value: Member;
  onChange: (member: Member) => void;
}

export function MemberForm({ value, onChange }: MemberFormProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const set = <K extends keyof Member>(key: K, next: Member[K]) =>
    onChange({ ...value, [key]: next });

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await api.upload(file);
      set("image", url);
    } catch (error) {
      setUploadError((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Name">
        <input className={inputClass} value={value.name} onChange={(e) => set("name", e.target.value)} />
      </Field>

      <Field label="Id (URL slug)" hint={value.id ? undefined : "Will be generated from the name"}>
        <input
          className={inputClass}
          value={value.id}
          placeholder={slugify(value.name)}
          onChange={(e) => set("id", e.target.value)}
        />
      </Field>

      <Field label="Passout year">
        <input
          className={inputClass}
          type="number"
          value={value.passoutYear || ""}
          onChange={(e) => set("passoutYear", Number(e.target.value))}
        />
      </Field>

      <Field label="Branch / major">
        <input className={inputClass} value={value.major} onChange={(e) => set("major", e.target.value)} />
      </Field>

      <Field label="Role / title">
        <input className={inputClass} value={value.role} onChange={(e) => set("role", e.target.value)} />
      </Field>

      <Field label="Vouched by" hint="Member id, or 'og-member'">
        <input
          className={inputClass}
          value={value.vouchedBy}
          onChange={(e) => set("vouchedBy", e.target.value)}
        />
      </Field>

      <Field label="Interests" hint="Comma-separated. First 3 show on the card.">
        <input
          className={inputClass}
          value={value.interests}
          onChange={(e) => set("interests", e.target.value)}
        />
      </Field>

      <Field label="Accent color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="h-9 w-12 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-1"
            value={/^#[0-9a-fA-F]{6}$/.test(value.color) ? value.color : "#FFB6C1"}
            onChange={(e) => set("color", e.target.value)}
          />
          <input className={inputClass} value={value.color} onChange={(e) => set("color", e.target.value)} />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => set("color", color)}
              style={{ backgroundColor: color }}
              className="h-5 w-5 rounded border border-black/10 transition-transform hover:scale-110"
              aria-label={color}
            />
          ))}
        </div>
      </Field>

      <div className="md:col-span-2">
        <Field label="Bio">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={value.bio}
            onChange={(e) => set("bio", e.target.value)}
          />
        </Field>
      </div>

      <Field label="GitHub" hint="Username or profile URL">
        <input className={inputClass} value={value.github} onChange={(e) => set("github", e.target.value)} />
      </Field>
      <Field label="LinkedIn" hint="Handle or profile URL">
        <input className={inputClass} value={value.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
      </Field>
      <Field label="Twitter / X" hint="Handle or profile URL">
        <input className={inputClass} value={value.twitter} onChange={(e) => set("twitter", e.target.value)} />
      </Field>
      <Field label="Instagram" hint="Handle or profile URL">
        <input className={inputClass} value={value.instagram} onChange={(e) => set("instagram", e.target.value)} />
      </Field>

      <div className="md:col-span-2">
        <Field label="Photo">
          <div className="flex items-start gap-3">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
              {value.image ? (
                <img src={value.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                  no photo
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                className={inputClass}
                placeholder="Image URL"
                value={value.image}
                onChange={(e) => set("image", e.target.value)}
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:rounded-md file:border-0 file:bg-[#1b66f3] file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-[#1b66f3]/90"
                />
                {uploading && <span className="text-xs text-gray-400">uploading…</span>}
              </div>
              {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
            </div>
          </div>
        </Field>
      </div>
    </div>
  );
}
