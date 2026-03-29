"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiLoader, FiCheckCircle } from "react-icons/fi";
import { toast } from "sonner";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const data = searchParams.get("data"); // eSewa v2 encoded response
      if (!data) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/verify-esewa`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ encodedData: data }),
        });
        console.log("Rewsponse from the vewification: ", res)
        const result = await res.json();
        if (result.success) {
          toast.success("Payment Successful! Resource Unlocked.");

          console.log("Result: ", result)
          // Redirect to the actual course viewer
          router.push(`/resource/${result.resourceId}`);
        }
      } catch (err) {
        toast.error("Verification failed. Contact support.");
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      {verifying ? (
        <>
          <FiLoader className="animate-spin" size={40} />
          <p className="font-black uppercase tracking-widest">Verifying Transaction...</p>
        </>
      ) : (
        <div className="text-center">
          <FiCheckCircle className="text-emerald-500 mx-auto mb-4" size={60} />
          <h1 className="text-2xl font-black uppercase">Purchase Confirmed</h1>
          <p className="text-slate-500 text-sm mt-2">Redirecting to your content...</p>
        </div>
      )}
    </div>
  );
}