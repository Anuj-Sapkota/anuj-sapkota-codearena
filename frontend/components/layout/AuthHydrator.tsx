"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { refreshSessionThunk } from "@/lib/store/features/auth/auth.actions";
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

        // OAuth redirect: token comes in the URL
        if (oauthToken) {
          tokenStore.set(oauthToken);
          const cleanSearch = status ? `?status=${status}` : "";
          window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
        }

        // If we already have a token in memory (e.g. just logged in via form),
        // still call refresh to get the latest user data and validate the session.
        // But if refresh fails and we have a token, don't log out — the token is valid.
        const alreadyHasToken = !!tokenStore.get();

        try {
          const result = await dispatch(refreshSessionThunk()).unwrap();

          if (status === "success") {
            toast.success("Account linked successfully!");
            window.history.replaceState({}, document.title, window.location.pathname);
          } else if (isOAuthFreshLogin) {
            const role = result?.user?.role;
            window.location.replace(
              role === "ADMIN" ? ROUTES.ADMIN.DASHBOARD : ROUTES.MAIN.EXPLORE
            );
          }
        } catch {
          // Refresh failed — only log out if we don't already have a valid in-memory token
          if (!alreadyHasToken) {
            dispatch(setLogout());
          }
          // If we have a token in memory, the user is still logged in from this session
          // (e.g. they just logged in and the cookie hasn't propagated yet)
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
