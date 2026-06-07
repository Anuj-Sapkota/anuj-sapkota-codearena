"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { RootState } from "@/lib/store/store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("USER" | "ADMIN")[];
}

/**
 * Public paths — guests can browse these without logging in.
 * Pattern: exact match OR startsWith for dynamic routes.
 *
 * Philosophy (same as Udemy / LeetCode):
 *  - Browse / discover → public
 *  - Interact / purchase / submit → requires auth (gate the action, not the page)
 */
const PUBLIC_EXACT = new Set([
  "/",
  "/login",
  "/register",
  "/explore",
  "/problems",
  "/challenges",
  "/learn",
  "/leaderboard",
]);

const PUBLIC_PREFIXES = [
  "/password/",   // forgot + reset
  "/resource/",   // course detail pages
  "/learn/",      // individual course preview
  "/u/",          // public user profiles
];

function isPublicPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  if (PUBLIC_EXACT.has(p)) return true;
  return PUBLIC_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname() || "";

  const isPublic = useMemo(() => isPublicPath(pathname), [pathname]);

  const isAuthorized = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const role = user.role.toUpperCase();
    if (allowedRoles.includes("ADMIN")) return role === "ADMIN";
    if (allowedRoles.includes("USER")) return role === "USER" || role === "ADMIN";
    return allowedRoles.includes(role as "USER" | "ADMIN");
  }, [isAuthenticated, user, allowedRoles]);

  useEffect(() => {
    if (isLoading) return;

    // Guest on a protected page → send to login
    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    // Authenticated but wrong role → redirect
    if (isAuthenticated && !isPublic && !isAuthorized) {
      const role = user?.role?.toUpperCase();
      router.replace(role === "ADMIN" ? "/admin" : "/explore");
    }
  }, [isAuthenticated, isLoading, isPublic, isAuthorized, router, pathname, user]);

  // Public pages always render
  if (isPublic) return <>{children}</>;

  // Still checking auth
  if (isLoading) return null;

  // Authenticated + authorized
  return isAuthenticated && isAuthorized ? <>{children}</> : null;
}
