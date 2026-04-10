import { FiBell, FiSettings, FiUser } from "react-icons/fi";

export const ROUTES = {
  HOME: "/",

  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/password/forgot",
    RESET_PASSWORD: "/password/reset",
  },

  MAIN: {
    EXPLORE: "/explore",
    PROBLEMS: "/problems",
    CHALLENGES: "/challenges",
    LEARN: "/learn",
    LEADERBOARD: "/leaderboard",
    PROFILE: "/u",
    SETTINGS: "/settings",
    ACCOUNTS_SECURITY: "/settings/accounts-security",
    NOTIFICATIONS: "/settings/notifications",
    RESOURCE: "/resource",
    PAYMENT: "/payment",
  },

  ADMIN: {
    DASHBOARD: "/admin",
    PROBLEMS: "/admin/problems",
    CHALLENGES: "/admin/challenges",
    CATEGORIES: "/admin/categories",
    BADGES: "/admin/badges",
    MODERATION: "/admin/moderation",
    APPLICATION: "/admin/application",
    USERS: "/admin/users",
  },

  CREATOR: {
    DASHBOARD: "/creator/dashboard",
    APPLY: "/creator/apply",
    CREATE: "/creator/dashboard/create",
  },
} as const;

// ─── Dynamic route helpers ────────────────────────────────────────────────────

export const getResetPasswordPath = (token: string) =>
  `${ROUTES.AUTH.RESET_PASSWORD}/${token}`;

export const getUserProfilePath = (username: string) =>
  `${ROUTES.MAIN.PROFILE}/${username}`;

export const getResourcePath = (id: string | number) =>
  `${ROUTES.MAIN.RESOURCE}/${id}`;

export const getProblemsByCategoryPath = (categoryId: number) =>
  `${ROUTES.MAIN.PROBLEMS}?categoryIds=${categoryId}`;

// ─── Navigation items ─────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { name: "Explore",      path: ROUTES.MAIN.EXPLORE },
  { name: "Problems",     path: ROUTES.MAIN.PROBLEMS },
  { name: "Learn",        path: ROUTES.MAIN.LEARN },
  { name: "Leaderboard",  path: ROUTES.MAIN.LEADERBOARD },
] as const;

export const SETTINGS_MENU_ITEMS = [
  { id: "basic",    name: "Basic Info",           icon: FiUser,     path: ROUTES.MAIN.SETTINGS },
  { id: "security", name: "Account and Security", icon: FiSettings, path: ROUTES.MAIN.ACCOUNTS_SECURITY },
  { id: "notifications", name: "Notifications",   icon: FiBell,     path: ROUTES.MAIN.NOTIFICATIONS },
] as const;

export const ADMIN_NAV_ITEMS = [
  { name: "Dashboard",    path: ROUTES.ADMIN.DASHBOARD },
  { name: "Problems",     path: ROUTES.ADMIN.PROBLEMS },
  { name: "Challenges",   path: ROUTES.ADMIN.CHALLENGES },
  { name: "Categories",   path: ROUTES.ADMIN.CATEGORIES },
  { name: "Badges",       path: ROUTES.ADMIN.BADGES },
  { name: "Moderation",   path: ROUTES.ADMIN.MODERATION },
  { name: "Applications", path: ROUTES.ADMIN.APPLICATION },
] as const;

export type AppRoute = typeof ROUTES;
