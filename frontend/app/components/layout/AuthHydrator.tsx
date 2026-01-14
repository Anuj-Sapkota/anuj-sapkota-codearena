"use client";
import { useEffect, useState, useRef } from "react";
import { getMeThunk } from "@/app/lib/store/features/authActions";
import { setLogout } from "@/app/lib/store/features/authSlice";
import { AppDispatch, RootState } from "@/app/lib/store/store";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

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
      if (hasCheckedAuth.current || user) {
        setIsLoading(false);
        return;
      }

      try {
        hasCheckedAuth.current = true;

        // 1. Tell TypeScript the shape of the response
        // We cast to unknown first to "break" the connection to AuthUser,
        // then to the shape we actually know is coming from the backend.
        const response = (await dispatch(getMeThunk()).unwrap()) as unknown as {
          success: boolean;
          data: {
            full_name: string;
            profile_pic_url?: string;
            bio?: string;
          };
        };

        if (response?.data) {
          const firstName = response.data.full_name.split(" ")[0];
          toast.success(`Welcome back, ${firstName}!`);
        }
      } catch (err: unknown) {
        // Silent fail for 401s (normal guest), error toast for 500s (server down)
        console.log(err);
        dispatch(setLogout());
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
