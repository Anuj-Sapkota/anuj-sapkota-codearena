"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiPlay,
  FiLock,
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiLoader,
  FiLayers,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { resourceService } from "@/lib/services/resource.service";
import { paymentService } from "@/lib/services/payment.service";
import { toast } from "sonner";

export default function CourseDetailPage() {
  const { id } = useParams();

  const {
    data: course,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceService.getResourceById(id as string),
  });

  //   const handlePayment = async () => {
  //     const toastId = toast.loading("Syncing with eSewa...");
  //     try {
  //       const data = await paymentService.initiateEsewa(id as string);

  //       // 1. Create the form
  //       const form = document.createElement("form");
  //       form.method = "POST";
  //       form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

  //       // 2. These 11 fields are MANDATORY for eSewa v2
  //       // We use a Map to ensure the keys are exactly what eSewa expects
  //       const payload: Record<string, string> = {
  //         amount: String(data.amount),
  //         tax_amount: String(data.tax_amount),
  //         total_amount: String(data.total_amount),
  //         transaction_uuid: String(data.transaction_uuid),
  //         product_code: String(data.product_code),
  //         product_service_charge: String(data.product_service_charge),
  //         product_delivery_charge: String(data.product_delivery_charge),
  //         success_url: String(data.success_url),
  //         failure_url: String(data.failure_url),
  //         signed_field_names: String(data.signed_field_names),
  //         signature: String(data.signature),
  //       };

  //       // 3. Append to form
  //       Object.entries(payload).forEach(([key, value]) => {
  //         const input = document.createElement("input");
  //         input.type = "hidden";
  //         input.name = key;
  //         input.value = value;
  //         form.appendChild(input);
  //       });

  //       document.body.appendChild(form);

  //       // 4. Debug: Log the frontend payload to console before submitting
  //       console.log("Form Payload being sent to eSewa:", payload);

  //       form.submit();

  //       // Cleanup
  //       setTimeout(() => document.body.removeChild(form), 1000);
  //     } catch (error) {
  //       console.error("Payment Step Error:", error);
  //       toast.error("Uplink failed", { id: toastId });
  //     }
  //   };

 const handlePayment = async () => {
  try {
    const data = await paymentService.initiateEsewa(id);

    const form = document.createElement("form");
    form.method = "POST";
    // Ensure no trailing slash on the action URL
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    // eSewa v2 is very picky about the order of fields in the POST body
    const fields = [
      "amount",
      "tax_amount",
      "total_amount",
      "transaction_uuid",
      "product_code",
      "product_service_charge",
      "product_delivery_charge",
      "success_url",
      "failure_url",
      "signed_field_names",
      "signature",
    ];

    fields.forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      // .trim() is CRITICAL here to remove hidden newlines/spaces
      input.value = String(data[key]).trim(); 
      form.appendChild(input);
    });

    document.body.appendChild(form);
    console.log("Submitting perfectly formatted form...");
    form.submit();
  } catch (error) {
    console.error("Payment Error:", error);
  }
};

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
        <FiLoader className="animate-spin text-black" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
          Syncing Intelligence
        </p>
      </div>
    );

  if (isError)
    return (
      <div className="p-20 text-center font-black uppercase">
        Data Core Offline
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] selection:bg-black selection:text-white">
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-3 mb-10">
              <span className="bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">
                Core Module
              </span>
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                {course?.language || "English"} Edition
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              {course?.title}
            </h1>
            <p className="text-slate-500 text-xl font-medium leading-relaxed mb-16 max-w-2xl border-l-4 border-black pl-8">
              {course?.description}
            </p>

            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-8">
                Curriculum Outline
              </h2>
              {course?.modules?.map((mod: any, index: number) => (
                <div
                  key={mod.id}
                  className="group flex items-center justify-between p-8 rounded-3xl border border-slate-100 bg-white hover:border-black transition-all duration-500"
                >
                  <div className="flex items-center gap-8 relative z-10">
                    <span className="text-4xl font-black italic text-slate-100 group-hover:text-black transition-colors duration-500">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="text-lg font-black uppercase tracking-tight">
                      {mod.title}
                    </h4>
                  </div>
                  <FiLock className="text-slate-300" size={18} />
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-black/10">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                      Access License
                    </span>
                    <h3 className="text-6xl font-black italic tracking-tighter">
                      ${course?.price}
                    </h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <FiZap size={14} className="fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Instant Uplink
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="group w-full py-8 bg-black text-white text-[12px] font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-slate-800 transition-all mb-8 flex items-center justify-center gap-6 active:scale-95"
                >
                  Unlock Intelligence{" "}
                  <FiArrowRight className="group-hover:translate-x-3 transition-transform" />
                </button>

                <div className="space-y-5 px-2">
                  {[
                    "Lifetime Access",
                    "Architect Certificate",
                    "Raw Exercise Assets",
                    "Private Community",
                  ].map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight"
                    >
                      <FiCheckCircle className="text-black" size={12} /> {feat}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
