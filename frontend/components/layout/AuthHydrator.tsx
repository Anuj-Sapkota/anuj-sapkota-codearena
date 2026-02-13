"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

import { getMeThunk } from "@/lib/store/features/auth/auth.actions";
import { setLogout } from "@/lib/store/features/auth/auth.slice";
import { AppDispatch, RootState } from "@/lib/store/store";

import type { GetMeResponse } from "@/types/user.types";

export default function AuthHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check if we just arrived from an OAuth redirect link
      const params = new URLSearchParams(window.location.search);
      const isReturningFromLink = params.get("status") === "success";

      // 2. Optimization: If we already have a user and aren't returning from a link,
      // or if we've already performed the check once, just stop loading.
      if (hasCheckedAuth.current || (user && !isReturningFromLink)) {
        setIsLoading(false);
        return;
      }

      try {
        hasCheckedAuth.current = true;

        // 3. Fetch user data from the backend (checks for session cookie)
        const response = (await dispatch(
          getMeThunk(),
        ).unwrap()) as GetMeResponse;

        // 4. Handle success toast for OAuth linking
        if (response?.user && isReturningFromLink) {
          toast.success(`Account linked successfully!`);

          // Clean the URL so the toast doesn't reappear on refresh
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      } catch (err: unknown) {
        // 5. If 401 Unauthorized (expected for guest users), clear Redux state
        dispatch(setLogout());

        // Log only if it's not a standard "no session" error to keep console clean
        console.log("Session initialization: No active session found.");
      } finally {
        // 6. CRITICAL: Stop the loading state regardless of outcome.
        // This allows ProtectedRoute and the Page to decide what to show.
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  // Loading Screen: Only show while the first-time auth check is in flight.
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48855b]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
