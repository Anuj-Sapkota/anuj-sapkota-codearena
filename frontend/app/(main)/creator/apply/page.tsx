"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { setStep } from "@/lib/store/features/creator/creator.slice";
import { FiPlus, FiFileText, FiAlertCircle, FiClock, FiCheckCircle } from "react-icons/fi";
import CreatorApplicationForm from "@/components/creator/applications/CreatorApplicationForm";
import { useApplyCreator, useVerifyCreatorOTP } from "@/hooks/useCreator";
import { verifyCreatorOTPThunk } from "@/lib/store/features/creator/creator.actions";

export default function CreatorApplyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  // step is pure UI state — keep in Redux
  const { step } = useSelector((state: RootState) => state.creator);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ bio: "", portfolioUrl: "", githubUrl: "" });
  const [otp, setOtp] = useState("");

  const applyCreator = useApplyCreator();
  const verifyOTP = useVerifyCreatorOTP();

  if (authLoading) return <div className="p-20 text-center uppercase font-black text-xs tracking-widest">Loading Profile...</div>;

  // --- VIEW 1: DASHBOARD ---
  if (!showForm && step === "FORM") {
    return (
      <div className="max-w-5xl mx-auto py-20 px-6">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
            Creator <span className="text-primary-1">Hub</span>
          </h1>
          <p className="text-slate-500 text-sm">Manage your professional application and status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border border-slate-200 p-8 rounded-sm bg-white shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest">Current Status</h3>
            {user?.creatorStatus === "REJECTED" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-rose-600">
                  <FiAlertCircle size={24} />
                  <span className="font-black uppercase tracking-tighter text-xl">Application Denied</span>
                </div>
                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm italic">
                  <strong>Feedback:</strong> "{user?.creatorProfile?.rejectionReason || "Please review your portfolio and try again."}"
                </div>
              </div>
            ) : user?.creatorStatus === "APPROVED" ? (
              <div className="flex items-center gap-3 text-emerald-600">
                <FiCheckCircle size={24} />
                <span className="font-black uppercase tracking-tighter text-xl">Verified Creator</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <FiFileText size={24} />
                <span className="font-black uppercase tracking-tighter text-xl">No Active Application</span>
              </div>
            )}
          </div>

          <div className="border border-slate-200 p-8 rounded-sm bg-slate-900 text-white shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-500 mb-6 tracking-widest">Actions</h3>
              <p className="text-sm text-slate-300 mb-8 leading-relaxed">
                {user?.creatorStatus === "REJECTED"
                  ? "Address the feedback above and submit a revised application for review."
                  : "Submit your technical details to join our marketplace as a verified creator."}
              </p>
            </div>
            {user?.creatorStatus !== "APPROVED" && (
              <button onClick={() => setShowForm(true)}
                className="w-full py-4 bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                <FiPlus /> {user?.creatorStatus === "REJECTED" ? "Re-Apply Now" : "Apply to be a Creator"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 2: UNDER REVIEW ---
  if (user?.creatorStatus === "PENDING" || step === "PENDING_ADMIN") {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6">
        <div className="border border-slate-200 bg-white p-10 rounded-sm text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <FiClock size={40} />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Under Review</h3>
              <p className="text-slate-500 text-sm mt-2">Our team is currently vetting your profile. This usually takes 24-48 hours.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: FORM ---
  return (
    <div className="relative">
      <button onClick={() => setShowForm(false)}
        className="absolute top-10 left-10 text-[10px] font-black uppercase underline tracking-widest">
        ← Back to Hub
      </button>
      <CreatorApplicationForm
        step={step}
        formData={formData}
        setFormData={setFormData}
        otp={otp}
        setOtp={setOtp}
        isSubmitting={applyCreator.isPending || verifyOTP.isPending}
        error={applyCreator.error?.message || verifyOTP.error?.message || null}
        handleApply={(e: any) => {
          e.preventDefault();
          applyCreator.mutate(formData, {
            onSuccess: () => dispatch(setStep("OTP")),
          });
        }}
        handleVerify={() => {
          // verifyCreatorOTPThunk updates auth slice (creatorStatus) — keep using it
          dispatch(verifyCreatorOTPThunk({ otp }));
        }}
        isReapplying={user?.creatorStatus === "REJECTED"}
      />
    </div>
  );
}
