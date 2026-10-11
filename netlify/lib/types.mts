// Shared shapes for the server side. Mirrors src/types/data.ts.

export type Member = {
  id: string;
  name: string;
  passoutYear: number;
  major: string;
  role: string;
  interests: string;
  color: string;
  image: string;
  bio: string;
  github: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  vouchedBy: string;
};

export type PendingItem = {
  /** Stable id from the source (Tally submission id, or generated for manual adds). */
  submissionId: string;
  submittedAt: string;
  source: "tally" | "manual";
  member: Member;
};
