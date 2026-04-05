"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

import { refreshSessionThunk } from "@/lib/store/features/auth/auth.actions";
import { setLogout } from "@/lib/store/features/auth/auth.slice";
import { tokenStore } from "@/lib/token";
import { AppDispatch } from "@/lib/store/store";

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

        // OAuth redirect: token comes back in the URL query param
        const oauthToken = params.get("token");
        if (oauthToken) {
          tokenStore.set(oauthToken);
          // Clean the token from the URL immediately
          const cleanUrl = window.location.pathname +
            (params.get("status") ? `?status=${params.get("status")}` : "");
          window.history.replaceState({}, document.title, cleanUrl);
        }

        // Use the httpOnly refreshToken cookie to get a fresh access token + user
        await dispatch(refreshSessionThunk()).unwrap();

        if (params.get("status") === "success") {
          toast.success("Account linked successfully!");
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch {
        // No valid refresh token — guest user, that's fine
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
