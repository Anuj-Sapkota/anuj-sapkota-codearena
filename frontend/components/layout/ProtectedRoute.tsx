"use client";

import { ReactNode, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { RootState } from "@/lib/store/store";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("USER" | "ADMIN")[]; 
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname() || "";

  // 1. Define Public Paths
  const isPublicPath = useMemo(() => {
    const path = pathname.toLowerCase();
    if (path.includes("password/reset") || path.includes("password/forgot")) {
      return true;
    }
    const staticPaths = ["/", "/login", "/register", "/explore"];
    return staticPaths.includes(path);
  }, [pathname]);

  // 2. Logic to determine if current user role meets requirements
  const isAuthorized = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;

    const userRole = user.role.toUpperCase();

    // Hierarchy Logic: 
    // - If page needs ADMIN, you MUST be ADMIN.
    // - If page needs USER, you can be USER OR ADMIN.
    if (allowedRoles.includes("ADMIN") && userRole !== "ADMIN") {
      return false;
    }
    
    if (allowedRoles.includes("USER") && (userRole === "USER" || userRole === "ADMIN")) {
      return true;
    }

    return allowedRoles.includes(userRole as "USER" | "ADMIN");
  }, [isAuthenticated, user, allowedRoles]);

  useEffect(() => {
    if (isLoading) return;

    // Redirect guest users to login
    if (!isAuthenticated && !isPublicPath) {
      router.replace("/login");
      return;
    }

    // Redirect authorized users away from pages they shouldn't be on
    if (isAuthenticated && !isPublicPath && !isAuthorized) {
      console.warn(`[RBAC] ${user?.role} is not authorized for ${pathname}`);
      
      // If a USER tries to hit an ADMIN page, send them back to explore
      if (user?.role?.toUpperCase() === "USER") {
        router.replace("/explore");
      } 
      // If an ADMIN somehow hits a blocked restricted page, send to admin dashboard
      else if (user?.role?.toUpperCase() === "ADMIN") {
        router.replace("/admin/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, isPublicPath, isAuthorized, router, pathname, user]);

  // Rendering Logic
  if (isPublicPath) return <>{children}</>;
  if (isLoading) return null; // Replace with <LoadingSpinner /> if you have one

  return isAuthenticated && isAuthorized ? <>{children}</> : null;
}