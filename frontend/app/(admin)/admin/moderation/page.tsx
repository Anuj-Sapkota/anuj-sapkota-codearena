"use client";

import { useEffect } from "react";
import {
  fetchFlaggedDiscussionsThunk,
  moderateDiscussionThunk,
} from "@/lib/store/features/discussion/discussion.actions";
import { formatDistanceToNow } from "date-fns";
import {
  MdShield,
  MdCheckCircle,
  MdBlock,
  MdOpenInNew,
  MdWarning,
  MdPerson,
} from "react-icons/md";
import Link from "next/link";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useDispatch, useSelector } from "react-redux";

export default function AdminModerationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { flaggedItems, isLoading, error } = useSelector(
    (state: RootState) => state.discussion,
  );

  useEffect(() => {
    dispatch(fetchFlaggedDiscussionsThunk());
  }, [dispatch]);

  const handleModerate = async (id: string, action: "BLOCK" | "UNBLOCK") => {
    const result = await dispatch(moderateDiscussionThunk({ id, action }));
    if (moderateDiscussionThunk.fulfilled.match(result)) {
      toast.success(
        `Discussion ${action === "BLOCK" ? "blocked" : "approved"} successfully`,
      );
    } else {
      toast.error("Action failed");
    }
  };

  if (isLoading && flaggedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-medium">Fetching violation reports...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <MdShield className="text-blue-600" />
            MODERATION_CENTER
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Reviewing flagged content for community safety.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-200">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-bold text-slate-700">
            {flaggedItems.length} Pending Incidents
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl flex items-center gap-3">
          <MdWarning size={20} />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Incident Cards */}
      <div className="grid gap-6">
        {flaggedItems.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center">
            <MdCheckCircle className="mx-auto text-6xl text-slate-100 mb-4" />
            <h3 className="text-slate-900 font-bold text-xl">Queue Empty</h3>
            <p className="text-slate-400 font-medium">
              No discussions currently meet the report threshold.
            </p>
          </div>
        ) : (
          flaggedItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row"
            >
              {/* Left Sidebar: Stats */}
              <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-white min-w-[160px]">
                <span className="text-4xl font-black">{item.reportCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  Reports
                </span>
                <div className="mt-6 flex flex-col gap-2 w-full">
                  <button
                    onClick={() => handleModerate(item.id, "UNBLOCK")}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                    title="Approve Content"
                  >
                    <MdCheckCircle size={18} />
                  </button>
                  <button
                    onClick={() => handleModerate(item.id, "BLOCK")}
                    disabled={item.isBlocked}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl transition-all shadow-lg ${
                      item.isBlocked
                        ? "bg-slate-700 cursor-not-allowed opacity-50"
                        : "bg-rose-500 hover:bg-rose-600 shadow-rose-900/20"
                    }`}
                    title="Block Content"
                  >
                    <MdBlock size={18} />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="p-8 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                      <MdPerson size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        @{item.user?.username || "anonymous"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        Posted {formatDistanceToNow(new Date(item.createdAt))}{" "}
                        ago
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 italic text-slate-700 leading-relaxed">
                  "{item.content}"
                </div>

                {/* Detailed Reports Section */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MdWarning className="text-amber-500" /> Violation_Log
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(item as any).reports?.map((report: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col gap-1 shadow-sm"
                      >
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">
                          {report.type?.replace(/_/g, " ") || "GENERAL REPORT"}
                        </span>
                        <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">
                          {report.details || "No additional details provided."}
                        </p>
                        <span className="text-[9px] text-slate-400 font-bold">
                          BY: @{report.user?.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Status Ribbon */}
              {item.isBlocked && (
                <div className="absolute top-0 right-0">
                  <div className="bg-slate-900 text-white text-[10px] font-black px-6 py-1 rotate-45 translate-x-4 translate-y-2 uppercase tracking-widest shadow-xl">
                    Blocked
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
