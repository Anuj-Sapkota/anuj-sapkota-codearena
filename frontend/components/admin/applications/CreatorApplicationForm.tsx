"use client";

import { FiArrowRight, FiMail, FiAlertCircle } from "react-icons/fi";

interface CreatorApplicationFormProps {
  step: "FORM" | "OTP" | "PENDING_ADMIN";
  formData: { bio: string; portfolioUrl: string; githubUrl: string };
  setFormData: (data: any) => void;
  otp: string;
  setOtp: (otp: string) => void;
  isSubmitting: boolean;
  error: string | null;
  handleApply: (e: React.FormEvent) => void;
  handleVerify: () => void;
  isReapplying: boolean;
}

export default function CreatorApplicationForm({
  step,
  formData,
  setFormData,
  otp,
  setOtp,
  isSubmitting,
  error,
  handleApply,
  handleVerify,
  isReapplying,
}: CreatorApplicationFormProps) {
  return (
    <div className="max-w-5xl mx-auto py-20 px-6">
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-12">
        Creator <span className="text-primary-1">Onboarding</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400">Requirements</h3>
          <ul className="space-y-3 text-sm text-slate-600 font-medium">
            {["Public GitHub Activity", "Portfolio Link", "Email Verification"].map((r, i) => (
              <li key={i} className="flex gap-2 items-center">
                <FiArrowRight className="text-primary-1" /> {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          {isReapplying && step === "FORM" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-3">
              <FiAlertCircle /> You are re-applying. Please ensure you have addressed previous feedback.
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
            {step === "FORM" ? (
              <form onSubmit={handleApply} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">Portfolio URL</label>
                    <input
                      type="url"
                      required
                      value={formData.portfolioUrl}
                      className="w-full border-b-2 py-2 focus:outline-none focus:border-slate-900 text-sm"
                      placeholder="https://..."
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400">GitHub URL</label>
                    <input
                      type="url"
                      required
                      value={formData.githubUrl}
                      className="w-full border-b-2 py-2 focus:outline-none focus:border-slate-900 text-sm"
                      placeholder="https://github.com/..."
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400">Bio & Experience</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.bio}
                    className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-900 text-sm bg-slate-50/50"
                    placeholder="Tell us about your professional background..."
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Processing..." : "Submit Application"} <FiArrowRight />
                </button>
              </form>
            ) : (
              <div className="p-16 text-center space-y-8">
                <FiMail size={32} className="mx-auto text-primary-1" />
                <h2 className="text-2xl font-black text-slate-900 uppercase">Verify Email</h2>
                <p className="text-xs text-slate-500 italic">Enter the 6-digit code sent to your email.</p>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  className="block w-full max-w-[200px] mx-auto text-center text-4xl font-black border-b-4 border-slate-900 focus:outline-none py-2 tracking-widest"
                  placeholder="000000"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  onClick={handleVerify}
                  disabled={otp.length < 6 || isSubmitting}
                  className="w-full py-4 bg-primary-1 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-2 transition-all"
                >
                  {isSubmitting ? "Verifying..." : "Complete Application"}
                </button>
              </div>
            )}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-rose-50 text-rose-600 text-[12px] font-bold border border-rose-100 flex items-center gap-2">
              <FiAlertCircle /> {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}