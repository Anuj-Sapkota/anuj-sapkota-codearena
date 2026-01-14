"use client";
import { useEffect, useState } from "react";
import { getMeThunk } from "../lib/store/features/authActions";
import { setLogout } from "../lib/store/features/authSlice";
import { AppDispatch, RootState } from "../lib/store/store";
import { useDispatch, useSelector } from "react-redux";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // Only fetch if not already authenticated
      if (!isAuthenticated) {
        try {
          // getMeThunk now handles the API call and the state update automatically
          await dispatch(getMeThunk()).unwrap();
        } catch (error) {
          // If the token is invalid/expired, clear the state
          dispatch(setLogout());
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-gray-500 h-screen relative inset-0 flex justify-center items-center">
      <div className="w-full max-w-md px-6">{children}</div>
    </div>
  );
}
