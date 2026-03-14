"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  applyCreatorThunk,
  verifyCreatorOTPThunk,
} from "@/lib/store/features/creator/creator.actions";
import {
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiMail,
  FiGlobe,
  FiGithub,
  FiInfo,
  FiArrowRight,
  FiXCircle,
} from "react-icons/fi";
import {
  resetCreatorState,
  setStep,
} from "@/lib/store/features/creator/creator.slice";

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

  // 🚀 SYNC LOGIC
  useEffect(() => {
    // If user is already PENDING in DB, lock the UI
    if (user?.creatorStatus === "PENDING") {
      dispatch(setStep("PENDING_ADMIN"));
    }

    // If user is REJECTED in DB, but the local UI is still on "OTP" or "PENDING",
    // reset them so they can see the rejection feedback.
    if (user?.creatorStatus === "REJECTED" && step === "PENDING_ADMIN") {
      dispatch(setStep("FORM"));
    }
  }, [user?.creatorStatus, dispatch, step]);

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
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                  Under Review
                </h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our administration team is currently reviewing your GitHub and
                Portfolio details.
              </p>
              <div className="mt-8 p-4 bg-slate-50 rounded-sm flex items-start gap-3 text-left">
                <FiInfo className="text-slate-400 mt-1 flex-shrink-0" />
                <p className="text-[12px] text-slate-600">
                  The vetting process usually takes 24-48 hours. Notification
                  sent to <strong>{user?.email}</strong>.
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
      <div className="max-w-4xl mx-auto mt-20 p-6">
        <h2 className="text-xl font-black text-slate-900 uppercase mb-6 text-center md:text-left">
          Application Status
        </h2>
        <div className="border border-rose-100 bg-white p-10 rounded-sm shadow-sm text-center md:text-left">
          <FiXCircle size={48} className="text-rose-500 mb-4 mx-auto md:mx-0" />
          <h3 className="text-2xl font-black text-slate-900 uppercase mb-4">
            Application Denied
          </h3>
          <div className="p-5 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm italic mb-6">
            &quot;
            {user?.creatorProfile?.rejectionReason || "Requirements not met."}
            &quot;
          </div>
          <button
            onClick={() => dispatch(setStep("FORM"))}
            className="text-xs font-black text-slate-900 underline uppercase tracking-widest"
          >
            Update Details & Re-Apply
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW 4: FORM / OTP ---
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-12">
        Creator <span className="text-primary-1">Onboarding</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400">
            Requirements
          </h3>
          <ul className="space-y-3 text-sm text-slate-600 font-medium">
            {[
              "Public GitHub Activity",
              "Portfolio Link",
              "Email Verification",
            ].map((r, i) => (
              <li key={i} className="flex gap-2 items-center">
                <FiArrowRight className="text-primary-1" /> {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            {step === "FORM" ? (
              <form onSubmit={handleApply} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <input
                    type="url"
                    required
                    value={formData.portfolioUrl}
                    className="w-full border-b-2 py-2 focus:outline-none focus:border-slate-900 text-sm"
                    placeholder="Portfolio URL"
                    onChange={(e) =>
                      setFormData({ ...formData, portfolioUrl: e.target.value })
                    }
                  />
                  <input
                    type="url"
                    required
                    value={formData.githubUrl}
                    className="w-full border-b-2 py-2 focus:outline-none focus:border-slate-900 text-sm"
                    placeholder="GitHub URL"
                    onChange={(e) =>
                      setFormData({ ...formData, githubUrl: e.target.value })
                    }
                  />
                </div>
                <textarea
                  rows={4}
                  required
                  value={formData.bio}
                  className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-900 text-sm bg-slate-50/50"
                  placeholder="Tell us about yourself..."
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Submit Application"}
                </button>
              </form>
            ) : (
              <div className="p-16 text-center space-y-8">
                <FiMail size={32} className="mx-auto text-primary-1" />
                <h2 className="text-2xl font-black text-slate-900 uppercase">
                  Enter OTP
                </h2>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  className="block w-full max-w-[200px] mx-auto text-center text-4xl font-black border-b-4 border-slate-900 focus:outline-none py-2"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  onClick={handleVerify}
                  disabled={otp.length < 6 || isSubmitting}
                  className="w-full py-4 bg-primary-1 text-white font-black text-xs uppercase tracking-widest"
                >
                  {isSubmitting ? "Verifying..." : "Complete Application"}
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-rose-50 text-rose-600 text-[12px] font-bold border border-rose-100">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
