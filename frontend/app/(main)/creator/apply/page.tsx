"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { 
  applyCreatorThunk, 
  verifyCreatorOTPThunk 
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
  FiXCircle
} from "react-icons/fi";
import { resetCreatorState } from "@/lib/store/features/creator/creator.slice";

export default function CreatorApplyPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux
  const { user } = useSelector((state: RootState) => state.auth);
  const { step, isSubmitting, isVerifying, error } = useSelector(
    (state: RootState) => state.creator
  );

  // Local Form State
  const [formData, setFormData] = useState({
    bio: "",
    portfolioUrl: "",
    githubUrl: "",
  });
  const [otp, setOtp] = useState("");

  // Clean up state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetCreatorState());
    };
  }, [dispatch]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(applyCreatorThunk(formData));
  };

  const handleVerify = () => {
    if (otp.length === 6) {
      dispatch(verifyCreatorOTPThunk({ otp }));
    }
  };

  // --- VIEW 1: APPROVED STATE ---
  if (user?.creatorStatus === "APPROVED") {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-12 border border-emerald-100 bg-white shadow-sm rounded-sm">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={40} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase">Verification Successful</h1>
        <p className="text-slate-500 mt-4 text-sm leading-relaxed">
          Congratulations! You are now a verified Creator on CodeArena. 
          You can now upload resources, set pricing, and manage your students.
        </p>
        <button 
          onClick={() => window.location.href = "/creator/dashboard"}
          className="mt-8 w-full py-4 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Enter Creator Studio
        </button>
      </div>
    );
  }

  // --- VIEW 2: PENDING / UNDER REVIEW ---
  if (step === "PENDING_ADMIN" || user?.creatorStatus === "PENDING") {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center p-12 border border-slate-200 bg-white shadow-sm rounded-sm">
        <FiClock size={50} className="text-blue-500 mx-auto mb-6 animate-pulse" />
        <h2 className="text-2xl font-black text-slate-900 uppercase">Application Under Review</h2>
        <p className="text-slate-500 mt-4 text-sm">
          Your portfolio and identity have been submitted to our administration team. 
          The vetting process usually takes <span className="font-bold text-slate-800">24-48 hours</span>.
        </p>
        <div className="mt-8 p-4 bg-slate-50 rounded-sm flex items-start gap-3 text-left">
          <FiInfo className="text-slate-400 mt-1 flex-shrink-0" />
          <p className="text-[12px] text-slate-600">
            We will send a confirmation email to <strong>{user?.email}</strong> once a decision is made. 
            Until then, your creator features remain locked.
          </p>
        </div>
      </div>
    );
  }

  // --- VIEW 3: REJECTED STATE (Show reason and allow re-application) ---
  if (user?.creatorStatus === "REJECTED") {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-12 border border-rose-100 bg-white shadow-sm rounded-sm text-center">
        <FiXCircle size={50} className="text-rose-500 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-slate-900 uppercase">Application Denied</h2>
        <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-sm italic">
          &quot;{user?.creatorProfile?.rejectionReason || "Your profile did not meet our community guidelines."}&quot;
        </div>
        <button 
          onClick={() => dispatch(resetCreatorState())} 
          className="mt-8 text-sm font-black text-slate-900 underline uppercase tracking-tighter"
        >
          Update Details and Re-Apply
        </button>
      </div>
    );
  }

  // --- VIEW 4: MAIN APPLICATION STEPS ---
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          Creator <span className="text-primary-1">Onboarding</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Elevate your account to start sharing professional coding resources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* LEFT: Guidelines */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Requirements</h3>
            <ul className="space-y-4">
              {[
                "Active GitHub profile with public repositories.",
                "Professional bio highlighting your expertise.",
                "Valid email for identity verification.",
                "Ownership of all uploaded resource materials."
              ].map((text, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <FiArrowRight className="text-primary-1 mt-1 flex-shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Form / OTP Interaction */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
            {step === "FORM" && (
              <form onSubmit={handleApply} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2">
                      <FiGlobe /> Portfolio URL
                    </label>
                    <input 
                      type="url" required 
                      className="w-full border-b-2 border-slate-100 py-2 focus:outline-none focus:border-slate-900 transition-colors text-sm"
                      placeholder="https://janedoe.dev"
                      onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-2">
                      <FiGithub /> GitHub URL
                    </label>
                    <input 
                      type="url" required
                      className="w-full border-b-2 border-slate-100 py-2 focus:outline-none focus:border-slate-900 transition-colors text-sm"
                      placeholder="https://github.com/jane-doe"
                      onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500">Professional Bio</label>
                  <textarea 
                    rows={4} required
                    className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-900 transition-colors text-sm bg-slate-50/50 rounded-sm"
                    placeholder="Briefly describe your background in software engineering or teaching..."
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Processing Request..." : "Submit Application"}
                  {!isSubmitting && <FiArrowRight />}
                </button>
              </form>
            )}

            {step === "OTP" && (
              <div className="p-16 text-center space-y-8">
                <div className="w-16 h-16 bg-primary-1/10 rounded-full flex items-center justify-center mx-auto text-primary-1">
                  <FiMail size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase">Verify Your Email</h2>
                  <p className="text-sm text-slate-500 mt-1">We&apos;ve sent a 6-digit code to <span className="font-bold">{user?.email}</span></p>
                </div>
                
                <input 
                  type="text" maxLength={6} 
                  className="block w-full max-w-[240px] mx-auto text-center text-4xl font-black tracking-[12px] border-b-4 border-slate-900 focus:outline-none py-4"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />

                <div className="pt-4">
                  <button 
                    onClick={handleVerify} 
                    disabled={isVerifying || otp.length < 6}
                    className="w-full py-4 bg-primary-1 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-2 transition-all disabled:opacity-50"
                  >
                    {isVerifying ? "Validating Code..." : "Complete Verification"}
                  </button>
                  <p className="mt-6 text-[11px] text-slate-400 uppercase font-bold tracking-tighter">
                    Didn&apos;t get the code? <span className="text-slate-900 cursor-pointer underline">Resend</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-[12px] font-bold flex items-center gap-3 animate-shake">
              <FiAlertCircle className="flex-shrink-0" size={16} /> 
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}