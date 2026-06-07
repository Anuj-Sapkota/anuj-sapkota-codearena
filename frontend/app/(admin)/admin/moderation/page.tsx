"use client";

import { useFlaggedDiscussions, useModerateDiscussion } from "@/hooks/useDiscussions";
import { formatDistanceToNow } from "date-fns";
import {
  FiShield, FiLoader, FiCheckCircle, FiSlash,
  FiUser, FiAlertTriangle, FiMessageSquare,
} from "react-icons/fi";

export default function AdminModerationPage() {
  const { data: flaggedItems = [], isLoading } = useFlaggedDiscussions();
  const moderateDiscussion = useModerateDiscussion();

  const handleModerate = (id: string, action: "BLOCK" | "UNBLOCK") =>
    moderateDiscussion.mutate({ id, action });

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Moderation<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Flagged content review
          </p>
        </div>
        {flaggedItems.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 px-4 py-2 rounded-sm shrink-0">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
              {flaggedItems.length} pending
            </span>
          </div>
        )}
      </div>

      {/* Stat */}
      <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4 w-fit">
        <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
          <FiShield size={15} className="text-rose-500" />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Flagged Discussions</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{flaggedItems.length}</p>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border-2 border-slate-100 rounded-sm">
          <FiLoader className="animate-spin text-slate-300" size={28} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Loading</p>
        </div>
      ) : flaggedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
          <FiCheckCircle size={28} className="text-emerald-300 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue is clear</p>
          <p className="text-[9px] text-slate-300 mt-1">No discussions meet the report threshold</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flaggedItems.map((item: any) => (
            <div key={item.id} className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-100 rounded-sm flex items-center justify-center shrink-0">
                    <FiUser size={13} className="text-slate-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900">@{item.user?.username || "anonymous"}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      {formatDistanceToNow(new Date(item.createdAt))} ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-sm uppercase tracking-widest">
                    <FiAlertTriangle size={10} /> {item.reportCount} reports
                  </span>
                  {item.isBlocked && (
                    <span className="text-[9px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-sm uppercase tracking-widest">
                      Blocked
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-5 py-4">
                <div className="bg-slate-50 border border-slate-100 rounded-sm p-4 text-sm text-slate-700 leading-relaxed italic mb-4">
                  "{item.content}"
                </div>

                {/* Reports */}
                {item.reports?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
                      <FiMessageSquare size={10} /> Violation reports
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.reports.map((r: any, i: number) => (
                        <div key={i} className="border border-slate-100 rounded-sm p-3 bg-white">
                          <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider">
                            {r.reportType?.replace(/_/g, " ") || "General"}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            {r.details || "No details provided"}
                          </p>
                          <p className="text-[9px] text-slate-400 mt-1">@{r.user?.username}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate(item.id, "UNBLOCK")}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    <FiCheckCircle size={12} /> Approve & Restore
                  </button>
                  <button
                    onClick={() => handleModerate(item.id, "BLOCK")}
                    disabled={item.isBlocked}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-rose-600 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiSlash size={12} /> Block Content
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
