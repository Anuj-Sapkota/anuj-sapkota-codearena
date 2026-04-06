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
        const oauthToken = params.get("token");
        const status = params.get("status");

        // If a token came back in the URL (OAuth redirect), store it immediately
        if (oauthToken) {
          tokenStore.set(oauthToken);
          // Strip token from URL right away so it's not visible or bookmarkable
          const cleanSearch = status ? `?status=${status}` : "";
          window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
        }

        await dispatch(refreshSessionThunk()).unwrap();

        // Show toast only for the account-linking flow (settings page redirect)
        if (status === "success") {
          toast.success("Account linked successfully!");
          window.history.replaceState({}, document.title, window.location.pathname);
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
