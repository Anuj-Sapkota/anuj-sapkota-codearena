/**
 * Single source of truth for supported languages on CodeArena (backend).
 * Must stay in sync with frontend/constants/languages.ts
 */
export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", judge0Id: 63 },
  { id: "python",     label: "Python",     judge0Id: 71 },
  { id: "java",       label: "Java",       judge0Id: 62 },
  { id: "cpp",        label: "C++",        judge0Id: 54 },
] as const;

export const JUDGE0_LANGUAGE_MAP: Record<number, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.judge0Id, l.label])
);

export const SUPPORTED_JUDGE0_IDS = SUPPORTED_LANGUAGES.map((l) => l.judge0Id);
