"use client";

import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation"; // Add usePathname

import { RootState } from "@/lib/store/store";
import { ROUTES } from "@/constants/routes";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const router = useRouter();
  const pathname = usePathname(); // Get the current URL

  useEffect(() => {
    if (isLoading) return;

    const publicPaths = [ROUTES.HOME, "/explore", "/register"];
    const isPublicPath = publicPaths.includes(pathname);
      console.error("REDIRECT TRIGGERED BY PROTECTED ROUTE AT:", pathname); 
    if (!isAuthenticated && !isPublicPath) {
      console.error("REDIRECT TRIGGERED BY PROTECTED ROUTE AT:", pathname); // Added this
      router.push(ROUTES.HOME);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // 4. If it's a public path, show it regardless of auth status
  const publicPaths = [ROUTES.HOME, ROUTES.MAIN.EXPLORE, "/register"];
  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // 5. If it's private, only show if authenticated
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
