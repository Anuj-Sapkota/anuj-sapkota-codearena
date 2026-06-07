// ─── Validation ──────────────────────────────────────────────────────────────
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10;
export const ADMIN_PAGE_SIZE = 7;

// ─── Gamification ─────────────────────────────────────────────────────────────
export const XP_PER_LEVEL = 500;

// ─── Difficulty labels ────────────────────────────────────────────────────────
export const DIFFICULTY_FILTERS = ["ALL", "EASY", "MEDIUM", "HARD"] as const;
export type DifficultyFilter = typeof DIFFICULTY_FILTERS[number];

// ─── Problem sort options ─────────────────────────────────────────────────────
export const PROBLEM_SORT_OPTIONS = [
  { label: "Newest Added", value: "" },
  { label: "Title (A - Z)", value: "title_asc" },
  { label: "Title (Z - A)", value: "title_desc" },
] as const;

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export const LEADERBOARD_PERIODS = ["weekly", "monthly", "all-time"] as const;
export type LeaderboardPeriod = typeof LEADERBOARD_PERIODS[number];
