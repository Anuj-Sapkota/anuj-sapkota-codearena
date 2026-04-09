"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { refreshSessionThunk, getMeThunk } from "@/lib/store/features/auth/auth.actions";
import { setLogout } from "@/lib/store/features/auth/auth.slice";
import { tokenStore } from "@/lib/token";
import { AppDispatch } from "@/lib/store/store";
import { ROUTES } from "@/constants/routes";

export default function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) { setIsLoading(false); return; }
    hasChecked.current = true;

    const init = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const oauthToken = params.get("token");
        const status = params.get("status");
        const isOAuthFreshLogin = !!oauthToken && status !== "success";

        // Store OAuth token immediately so api.ts sends it as Bearer
        if (oauthToken) {
          tokenStore.set(oauthToken);
          const cleanSearch = status ? `?status=${status}` : "";
          window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
        }

        let result: any = null;

        try {
          // Try refresh cookie first (works when same-origin or sameSite=none+secure)
          result = await dispatch(refreshSessionThunk()).unwrap();
        } catch {
          // Refresh cookie failed — if we have a Bearer token in memory, use getMe instead
          if (tokenStore.get()) {
            try {
              result = await dispatch(getMeThunk()).unwrap();
            } catch {
              // Both failed — guest
              if (!oauthToken) dispatch(setLogout());
            }
          } else {
            dispatch(setLogout());
          }
        }

        if (result) {
          if (status === "success") {
            toast.success("Account linked successfully!");
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (isOAuthFreshLogin) {
            const role = result?.user?.role;
            window.location.replace(
              role === "ADMIN" ? ROUTES.ADMIN.DASHBOARD : ROUTES.MAIN.EXPLORE
            );
          }
        }
      } catch {
        dispatch(setLogout());
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48855b]" />
      </div>
    );
  }

  return <>{children}</>;
}
