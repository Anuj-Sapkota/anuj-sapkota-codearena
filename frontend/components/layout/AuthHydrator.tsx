"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { getMeThunk } from "@/lib/store/features/auth.actions";
import { setLogout } from "@/lib/store/features/auth.slice";
import { AppDispatch, RootState } from "@/lib/store/store";

import type { GetMeResponse } from "@/types/user.types";

export default function AuthHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if we just arrived from an OAuth redirect
      const params = new URLSearchParams(window.location.search);
      const isReturningFromLink = params.get("status") === "success";

      // Only skip if we've checked AND we aren't returning from a link update
      if (hasCheckedAuth.current || (user && !isReturningFromLink)) {
        setIsLoading(false);
        return;
      }

      try {
        hasCheckedAuth.current = true;

        // Fetch the absolute latest user data from DB
        const response = (await dispatch(
          getMeThunk()
        ).unwrap()) as GetMeResponse;
        if (response?.user && isReturningFromLink) {
          toast.success(`Account linked successfully!`);
          // Cleaning the URL so it doesn't keep refetching on every render
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      } catch (err: unknown) {
        dispatch(setLogout());
        console.log("Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#48855b]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
