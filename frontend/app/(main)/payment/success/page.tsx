"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCheckCircle, FiLoader, FiAlertCircle } from "react-icons/fi";
import api from "@/lib/api";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const data = searchParams.get("data");

  const {
    mutate: verifyPayment,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (encodedData: string) => {
      return await api.post("/payments/verify-esewa", { encodedData });
    },
    onSuccess: (response) => {
      try {
        if (data) {
          // 1. Decode locally just to get the resId for cache invalidation
          const decodedData = JSON.parse(atob(data));
          const parts = decodedData.transaction_uuid.split("-");
          const resId = parts[1];

          // 2. CRITICAL: Invalidate the specific resource and global lists
          // This ensures that when the user redirects, 'isOwned' will be true.
          queryClient.invalidateQueries({ queryKey: ["user-purchases"] });
          queryClient.invalidateQueries({ queryKey: ["resources"] });
          queryClient.invalidateQueries({ queryKey: ["resource", resId] });

          // 3. Redirect to the learning page
          setTimeout(() => {
            router.push(`/learn/${resId}`);
          }, 3000);
        }
      } catch (e) {
        console.error("Redirection error:", e);
        setTimeout(() => router.push("/dashboard"), 3000);
      }
    },
    onError: (error) => {
      console.error("Verification failed:", error);
      setTimeout(() => router.push("/payment/failure"), 2000);
    },
  });

  useEffect(() => {
    // Only trigger if data exists and we haven't already started a mutation
    if (data && !isPending && !isError) {
      verifyPayment(data);
    }
  }, [data, verifyPayment]);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center bg-white dark:bg-slate-950">
      {isError ? (
        <div className="animate-in fade-in zoom-in duration-300">
          <FiAlertCircle className="text-red-500 mb-6 mx-auto" size={80} />
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Verification Failed
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4">
            Redirecting to failure page...
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-500">
          <FiCheckCircle className="text-emerald-500 mb-6 mx-auto" size={80} />
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
            Payment Successful
          </h1>

          <div className="mt-6 flex flex-col items-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              {isPending
                ? "We're verifying your transaction with eSewa..."
                : "License activated! Preparing your classroom..."}
            </p>

            <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full">
              <FiLoader className="animate-spin text-emerald-500" size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
                {isPending ? "Validating" : "Redirecting"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
