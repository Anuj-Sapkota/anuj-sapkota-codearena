/**
 * Single source of truth for all supported languages on CodeArena.
 * Used by: workspace editor, problem creation, leaderboard, code wrapper.
 */
export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", judge0Id: 63, monacoId: "javascript" },
  { id: "python",     label: "Python",     judge0Id: 71, monacoId: "python"     },
  { id: "java",       label: "Java",       judge0Id: 62, monacoId: "java"       },
  { id: "cpp",        label: "C++",        judge0Id: 54, monacoId: "cpp"        },
] as const;

export type SupportedLanguageId = typeof SUPPORTED_LANGUAGES[number]["id"];

/** Map judge0Id → language label — used by backend and leaderboard */
export const JUDGE0_LANGUAGE_MAP: Record<number, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.judge0Id, l.label])
);

/** Map judge0Id → language id string */
export const JUDGE0_TO_ID: Record<number, string> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((l) => [l.judge0Id, l.id])
);
