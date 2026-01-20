// constants/routes.ts

import config from "@/config";
import { FiBell, FiSettings, FiUser } from "react-icons/fi";

export const ROUTES = {
  // Public Auth Routes
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/password/forgot",
    RESET_PASSWORD: "/password/reset",
  },

  // Protected Main Routes
  MAIN: {
    EXPLORE: "/explore",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    ACCOUNTS_SECURITY: "/settings/accounts-security",
    PROBLEMS: "/problems",
    LEARN: "/learn",
    NOTIFICATIONS: "/settings/notifications",
  },
  ADMIN: {
    DASHBOAD: "/admin",
    CATEGORY: "/admin/category",
  },
  // Static Pages
  HOME: "/",
} as const;

export const API_ROUTES = {
  AUTH: {
    SOCIAL: (provider: string) => `${config.apiUrl}/auth/${provider}`,
    LOGOUT: `${config.apiUrl}/auth/logout`,
  },
};
/**
 * Navigation items for the Navbar
 * Defined separately to make mapping easier and keep names consistent
 */
export const NAV_ITEMS = [
  { name: "Explore", path: ROUTES.MAIN.EXPLORE },
  { name: "Problems", path: ROUTES.MAIN.PROBLEMS },
  { name: "Learn", path: ROUTES.MAIN.LEARN },
] as const;

export const SETTINGS_MENU_ITEMS = [
  {
    id: "basic",
    name: "Basic Info",
    icon: FiUser,
    path: ROUTES.MAIN.SETTINGS,
  },
  {
    id: "security",
    name: "Account and Security",
    icon: FiSettings,
    path: ROUTES.MAIN.ACCOUNTS_SECURITY,
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: FiBell,
    path: ROUTES.MAIN.NOTIFICATIONS,
  },
] as const;

/**
 * Dynamic Route Helpers
 * functions for routes that require tokens or IDs
 */
export const getResetPasswordPath = (token: string) =>
  `${ROUTES.AUTH.RESET_PASSWORD}/${token}`;

export const getUserProfilePath = (username: string) =>
  `${ROUTES.MAIN.PROFILE}/${username}`;

// This type allows usage of ROUTES in the code with full IDE autocompletion
export type AppRoute = typeof ROUTES;
