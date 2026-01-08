"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../lib/store/store";
import api from "../lib/api";
import { useEffect, useState } from "react";
import { setCredentials, logout } from "../lib/store/features/authSlice";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!isAuthenticated) {
          const response = await api.get("/auth/me");

          dispatch(
            setCredentials({
              user: response.data.user,
              token: response.data.token,
            })
          );
        }
      } catch (error) {
        //if validation fails auto logout
        dispatch(logout());
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch, isAuthenticated]);

  // Optional: Show a loading spinner while checking the cookie
  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="bg-gray-500 h-screen relative inset-0 flex justify-center items-center">
      <div className="w-full max-w-md px-6">{children}</div>
    </div>
  );
}