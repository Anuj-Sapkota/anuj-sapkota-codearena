/**
 * API endpoint paths — relative to the base API URL.
 * Import `config.apiUrl` separately when building full URLs.
 */
export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    GOOGLE: "/auth/google",
    GITHUB: "/auth/github",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: (token: string) => `/auth/reset-password/${token}`,
    CHANGE_PASSWORD: "/auth/change-password",
    SET_INITIAL_PASSWORD: "/auth/set-initial-password",
    UNLINK: "/auth/unlink",
    DELETE_ACCOUNT: "/auth/delete-account",
  },
  PROBLEMS: {
    BASE: "/problems",
    BY_ID: (id: string | number) => `/problems/${id}`,
  },
  CATEGORIES: {
    BASE: "/categories",
    BY_ID: (id: number) => `/categories/${id}`,
  },
  CHALLENGES: {
    BASE: "/challenges",
    PUBLIC: "/challenges/public",
    BY_SLUG: (slug: string) => `/challenges/${slug}`,
    BY_ID: (id: number) => `/challenges/${id}`,
  },
  DISCUSSIONS: {
    BASE: "/discussions",
    BY_ID: (id: number) => `/discussions/${id}`,
    FLAGGED: "/discussions/flagged",
    FLAG: (id: number) => `/discussions/${id}/flag`,
    RESOLVE: (id: number) => `/discussions/${id}/resolve`,
  },
  RESOURCES: {
    BASE: "/resources",
    EXPLORE: "/resources/explore",
    BY_ID: (id: string | number) => `/resources/${id}`,
  },
  LEADERBOARD: "/leaderboard",
  SUBMISSIONS: {
    BASE: "/submissions",
    BY_ID: (id: string | number) => `/submissions/${id}`,
    HISTORY: (problemId: string | number) => `/submissions/history/${problemId}`,
  },
  USERS: {
    BASE: "/users",
    BY_USERNAME: (username: string) => `/users/${username}`,
    UPDATE: (id: number) => `/users/${id}`,
  },
  CREATOR: {
    APPLY: "/creator/apply",
    VERIFY_OTP: "/creator/verify-otp",
    APPLICATIONS: "/creator/applications",
    REVIEW: (id: number) => `/creator/applications/${id}/review`,
  },
  UPLOAD: {
    IMAGE: "/upload/image",
  },
  BADGES: {
    BASE: "/badges",
    BY_ID: (id: number) => `/badges/${id}`,
  },
  PAYMENT: {
    INITIATE: "/payment/initiate",
    VERIFY: "/payment/verify",
  },
} as const;
