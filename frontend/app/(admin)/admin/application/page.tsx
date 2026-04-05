"use client";

import { useState } from "react";
import { usePendingApplications, useReviewApplication } from "@/hooks/useCreator";
import { FiCheck, FiX, FiGithub, FiGlobe, FiMessageSquare } from "react-icons/fi";

export default function PendingCreatorsPage() {
  const { data: pendingApplications = [], isLoading } = usePendingApplications();
  const reviewApplication = useReviewApplication();
  const isSubmitting = reviewApplication.isPending;

  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReview = (userId: number, status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !rejectionReason) {
      return;
    }
    reviewApplication.mutate({
      targetUserId: userId,
      status,
      reason: status === "REJECTED" ? rejectionReason : undefined,
    }, {
      onSuccess: () => { setSelectedUser(null); setRejectionReason(""); },
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black uppercase tracking-tighter">
          Creator Applications
        </h1>
        <p className="text-slate-500 text-sm">
          Review and verify expert profiles for the marketplace.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-[10px] font-black uppercase text-slate-500">
                Applicant
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-500">
                Links
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-500">
                Bio / Background
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pendingApplications.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="p-20 text-center text-slate-400 font-medium italic"
                >
                  No pending applications found.
                </td>
              </tr>
            ) : (
              pendingApplications.map((app) => (
                <tr
                  key={app.userId}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-900">
                      {app.full_name}
                    </div>
                    <div className="text-xs text-slate-500">{app.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <a
                        href={app.creatorProfile?.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-900 hover:text-white transition-all"
                      >
                        <FiGithub size={14} />
                      </a>
                      <a
                        href={app.creatorProfile?.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 rounded-full hover:bg-slate-900 hover:text-white transition-all"
                      >
                        <FiGlobe size={14} />
                      </a>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {app.creatorProfile?.bio}
                    </p>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={isSubmitting}
                        onClick={() => handleReview(app.userId, "APPROVED")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-sm hover:bg-emerald-600 transition-all disabled:opacity-50"
                      >
                        <FiCheck /> Approve
                      </button>
                      <button
                        disabled={isSubmitting}
                        onClick={() => setSelectedUser(app.userId)}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase rounded-sm hover:bg-rose-600 transition-all disabled:opacity-50"
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- REJECTION MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <FiMessageSquare className="text-rose-500" size={24} />
              <h2 className="text-xl font-black uppercase tracking-tighter">
                Rejection Feedback
              </h2>
            </div>
            <textarea
              className="w-full border p-4 text-sm bg-slate-50 focus:outline-none focus:border-slate-900 rounded-sm"
              rows={4}
              placeholder="Explain why the application was denied..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setRejectionReason("");
                }}
                className="flex-1 py-3 text-xs font-black uppercase border border-slate-200 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleReview(selectedUser, "REJECTED")}
                className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase hover:bg-slate-800 transition-all disabled:opacity-50"
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