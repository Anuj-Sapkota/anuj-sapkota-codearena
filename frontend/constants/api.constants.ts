/**
 * API endpoint paths — relative to the base API URL.
 * Import `config.apiUrl` separately when building full URLs.
 */
export const API = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
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
    STATS: (problemId: string | number) => `/submissions/stats/${problemId}`,
  },
  USERS: {
    BASE: "/users",
    BY_USERNAME: (username: string) => `/users/${username}`,
    UPDATE: (id: number) => `/users/${id}`,
  },
  CREATOR: {
    APPLY: "/creator/apply",
    VERIFY_OTP: "/creator/verify",
    APPLICATIONS: "/creator/pending-creators",
    REVIEW: (id: number) => `/creator/applications/${id}/review`,
  },
  UPLOAD: {
    IMAGE: "/upload/image",
  },
  BADGES: {
    BASE: "/badge/library",
    CREATE: "/badge/admin/create",
    BY_ID: (id: string) => `/badge/admin/${id}`,
  },
  PAYMENT: {
    INITIATE: "/payment/initiate",
    VERIFY: "/payment/verify",
  },
  ADMIN: {
    STATS: "/admin/stats",
    USERS: "/admin/users",
    USER_ROLE: (id: number) => `/admin/users/${id}/role`,
    USER_BAN: (id: number) => `/admin/users/${id}/ban`,
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    READ_ALL: "/notifications/read",
    READ_ONE: (id: string) => `/notifications/${id}/read`,
    DELETE: (id: string) => `/notifications/${id}`,
  },
} as const;
