"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { RootState } from "@/lib/store/store";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname() || "";

  // 1. "Paranoid" Public Check
  const isPublicPath = useMemo(() => {
    // Convert to lowercase to avoid case-sensitivity issues
    const path = pathname.toLowerCase();
    
    // Explicitly allow the reset path via loose matching
    if (path.includes("password/reset") || path.includes("password/forgot")) {
      return true;
    }

    const staticPaths = ["/", "/login", "/register", "/explore"];
    return staticPaths.includes(path);
  }, [pathname]);

  useEffect(() => {
    // DEBUG: Open your browser console (F12) to see these values!
    if (pathname.includes("password")) {
      console.log(`[ProtectedRoute] Path: ${pathname} | IsPublic: ${isPublicPath} | Authed: ${isAuthenticated}`);
    }

    // Do nothing while loading
    if (isLoading) return;

    // Redirect ONLY if strictly necessary
    if (!isAuthenticated && !isPublicPath) {
      console.warn("!!! ProtectedRoute is triggering the redirect !!!");
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, isPublicPath, router, pathname]);

  // 2. Bypass Logic: If it's public, return children IMMEDIATELY
  if (isPublicPath) {
    return <>{children}</>;
  }

  // 3. Loading State
  if (isLoading) {
    return null; // Or a spinner
  }

  // 4. Auth Check
  return isAuthenticated ? <>{children}</> : null;
}