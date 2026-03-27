"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheckCircle, FiLoader } from "react-icons/fi";
import api from "@/lib/api";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const data = searchParams.get("data");

  useEffect(() => {
    const verify = async () => {
      try {
        // Send the encoded data string to the backend to verify and grant access
        await api.post("/payments/verify-esewa", { encodedData: data });
        setTimeout(() => router.push("/dashboard"), 3000);
      } catch (err) {
        router.push("/payment/failure");
      }
    };
    if (data) verify();
  }, [data]);

  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <FiCheckCircle className="text-emerald-500 mb-6" size={80} />
      <h1 className="text-4xl font-black uppercase tracking-tighter">
        Payment Successful
      </h1>
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
        <FiLoader className="animate-spin" /> Syncing your license...
      </p>
    </div>
  );
}
