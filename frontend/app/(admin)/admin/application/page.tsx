"use client";

import { useState } from "react";
import { usePendingApplications, useReviewApplication } from "@/hooks/useCreator";
import {
  FiCheck, FiX, FiGithub, FiGlobe, FiLoader,
  FiMail, FiUser, FiAlertCircle,
} from "react-icons/fi";

export default function PendingCreatorsPage() {
  const { data: pendingApplications = [], isLoading } = usePendingApplications();
  const reviewApplication = useReviewApplication();
  const isSubmitting = reviewApplication.isPending;

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReview = (userId: number, status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectionReason.trim()) return;
    reviewApplication.mutate(
      { targetUserId: userId, status, reason: status === "REJECTED" ? rejectionReason : undefined },
      { onSuccess: () => { setSelectedUser(null); setRejectionReason(""); } },
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Applications<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Creator verification queue
          </p>
        </div>
        {pendingApplications.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-4 py-2 rounded-sm shrink-0">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              {pendingApplications.length} pending
            </span>
          </div>
        )}
      </div>

      {/* Stat */}
      <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4 w-fit">
        <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
          <FiMail size={15} className="text-amber-500" />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Applications</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{pendingApplications.length}</p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border-2 border-slate-100 rounded-sm">
          <FiLoader className="animate-spin text-slate-300" size={28} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Loading</p>
        </div>
      ) : pendingApplications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
          <FiCheck size={28} className="text-emerald-300 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No pending applications</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50/60">
                  {["Applicant", "Links", "Bio", "Actions"].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 3 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApplications.map((app: any) => (
                  <tr key={app.userId} className="hover:bg-slate-50/50 transition-colors">
                    {/* Applicant */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-sm flex items-center justify-center shrink-0">
                          {app.profile_pic_url
                            ? <img src={app.profile_pic_url} alt="" className="w-full h-full object-cover rounded-sm" />
                            : <FiUser size={14} className="text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{app.full_name}</p>
                          <p className="text-[10px] text-slate-400">{app.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Links */}
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {app.creatorProfile?.githubUrl && (
                          <a href={app.creatorProfile.githubUrl} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                            <FiGithub size={12} />
                          </a>
                        )}
                        {app.creatorProfile?.portfolioUrl && (
                          <a href={app.creatorProfile.portfolioUrl} target="_blank" rel="noopener noreferrer"
                            className="w-7 h-7 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
                            <FiGlobe size={12} />
                          </a>
                        )}
                        {!app.creatorProfile?.githubUrl && !app.creatorProfile?.portfolioUrl && (
                          <span className="text-[10px] text-slate-300 font-bold">—</span>
                        )}
                      </div>
                    </td>

                    {/* Bio */}
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {app.creatorProfile?.bio || <span className="text-slate-300 italic">No bio provided</span>}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleReview(app.userId, "APPROVED")}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-600 transition-all disabled:opacity-50 active:scale-95"
                        >
                          <FiCheck size={11} /> Approve
                        </button>
                        <button
                          disabled={isSubmitting}
                          onClick={() => setSelectedUser(app.userId)}
                          className="flex items-center gap-1.5 px-3 py-2 border-2 border-rose-200 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all disabled:opacity-50 active:scale-95"
                        >
                          <FiX size={11} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => e.currentTarget === e.target && setSelectedUser(null)}>
          <div className="bg-white w-full max-w-md rounded-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <FiAlertCircle size={15} className="text-rose-500" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Rejection Reason</h3>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                <FiX size={14} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                rows={4}
                className="w-full border-2 border-slate-200 rounded-sm px-4 py-3 text-sm font-medium text-slate-900 bg-white outline-none focus:border-slate-900 transition-colors resize-none"
                placeholder="Explain why the application was denied..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <p className="text-[9px] text-slate-400">This message will be visible to the applicant.</p>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => { setSelectedUser(null); setRejectionReason(""); }}
                className="flex-1 py-2.5 border-2 border-slate-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting || !rejectionReason.trim()}
                onClick={() => handleReview(selectedUser, "REJECTED")}
                className="flex-1 py-2.5 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-40 active:scale-95"
              >
                {isSubmitting ? "Processing..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
