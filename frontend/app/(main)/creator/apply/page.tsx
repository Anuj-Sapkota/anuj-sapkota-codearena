"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  applyCreatorThunk,
  verifyCreatorOTPThunk,
} from "@/lib/store/features/creator/creator.actions";
import { setStep } from "@/lib/store/features/creator/creator.slice";
import { FiCheckCircle, FiClock, FiInfo } from "react-icons/fi";

// Sub-components
import CreatorApplicationForm from "@/components/admin/applications/CreatorApplicationForm";
import CreatorRejectionView from "@/components/admin/applications/CreatorRejectionView";

export default function CreatorApplyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading: authLoading } = useSelector(
    (state: RootState) => state.auth,
  );
  const { step, isSubmitting, error } = useSelector(
    (state: RootState) => state.creator,
  );

  const [formData, setFormData] = useState({
    bio: "",
    portfolioUrl: "",
    githubUrl: "",
  });
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (user?.creatorStatus === "PENDING") {
      dispatch(setStep("PENDING_ADMIN"));
    }
  }, [user?.creatorStatus, dispatch]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(applyCreatorThunk(formData));
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      dispatch(verifyCreatorOTPThunk({ otp }));
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Verifying Profile
          </p>
        </div>
      </div>
    );
  }

  // --- VIEW 1: APPROVED ---
  if (user?.creatorStatus === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-12 border border-emerald-100 bg-white shadow-sm rounded-sm">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
          Verification Successful
        </h1>
        <p className="text-slate-500 mt-4 text-sm leading-relaxed">
          Congratulations! You are now a verified Creator.
        </p>
        <button
          onClick={() => (window.location.href = "/creator/dashboard")}
          className="mt-8 w-full py-4 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Enter Creator Studio
        </button>
      </div>
    );
  }

  // --- VIEW 2: PENDING ---
  if (user?.creatorStatus === "PENDING" || step === "PENDING_ADMIN") {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-6">
        <h2 className="text-xl font-black text-slate-900 uppercase mb-6 tracking-tighter text-center md:text-left">
          Application Status
        </h2>
        <div className="border border-slate-200 bg-white p-10 rounded-sm shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
              <FiClock size={40} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Under Review
              </h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Our administration team is currently reviewing your GitHub and
                Portfolio details.
              </p>
              <div className="mt-8 p-4 bg-slate-50 rounded-sm flex items-start gap-3 text-left">
                <FiInfo className="text-slate-400 mt-1 flex-shrink-0" />
                <p className="text-[12px] text-slate-600">
                  The vetting process usually takes 24-48 hours. Notification
                  will be sent to <strong>{user?.email}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW 3: REJECTED ---
  if (user?.creatorStatus === "REJECTED" && step !== "FORM") {
    return (
      <CreatorRejectionView
        reason={user?.creatorProfile?.rejectionReason}
        onReapply={() => dispatch(setStep("FORM"))}
      />
    );
  }

  // --- VIEW 4: FORM / OTP ---
  return (
    <CreatorApplicationForm
      step={step}
      formData={formData}
      setFormData={setFormData}
      otp={otp}
      setOtp={setOtp}
      isSubmitting={isSubmitting}
      error={error}
      handleApply={handleApply}
      handleVerify={handleVerify}
      isReapplying={user?.creatorStatus === "REJECTED"}
    />
  );
}
