"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import {
  setSelectedSubmission,
  setDescriptionTab,
} from "@/lib/store/features/workspace/workspace.slice";
import { SubmissionRecord } from "@/types/workspace.types";
import { FaCheckCircle, FaTimesCircle, FaChevronRight } from "react-icons/fa";
import { MdHistory, MdAccessTime, MdMemory } from "react-icons/md";
import { fetchSubmissionHistoryThunk } from "@/lib/store/features/workspace/workspace.actions";
import { useEffect } from "react";

export const SubmissionList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentProblem } = useSelector((state: RootState) => state.problem);
  const { user } = useSelector((state: RootState) => state.auth);
  const { submissions, isFetchingHistory } = useSelector(
    (state: RootState) => state.workspace,
  );

  useEffect(() => {
    if (currentProblem?.problemId && user) {
      dispatch(fetchSubmissionHistoryThunk(currentProblem.problemId.toString()));
    }
  }, [dispatch, currentProblem?.problemId, user]);

  const handleSelectSubmission = (submission: SubmissionRecord) => {
    dispatch(setSelectedSubmission(submission));
    dispatch(setDescriptionTab("detail"));
  };

  if (isFetchingHistory) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <MdHistory className="text-5xl mb-4 opacity-10" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-center">
          No_Submissions_Found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
          <MdHistory className="text-base" /> History_Log ({submissions.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {submissions.map((sub: SubmissionRecord) => {
          const isAccepted = sub.status === "ACCEPTED";

          return (
            <button
              key={sub.id}
              onClick={() => handleSelectSubmission(sub)}
              className="group cursor-pointer flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/10 transition-all text-left"
            >
              <div className="flex items-center gap-5">
                {/* Status Icon */}
                <div className="shrink-0">
                  {isAccepted ? (
                    <FaCheckCircle className="text-2xl text-emerald-500" />
                  ) : (
                    <FaTimesCircle className="text-2xl text-red-500" />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <span
                      className={`text-sm font-black uppercase tracking-tight ${
                        isAccepted ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {sub.status.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(sub.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* METRICS DASHBOARD STYLE */}
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                      <MdAccessTime className="text-slate-400 text-sm" />
                      <span className="text-xs font-bold font-mono text-slate-700">
                        {isAccepted && sub.time ? `${(sub.time * 1000).toFixed(0)} ms` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                      <MdMemory className="text-slate-400 text-sm" />
                      <span className="text-xs font-bold font-mono text-slate-700">
                        {isAccepted && sub.memory ? `${(sub.memory / 1024).toFixed(1)} MB` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Open</span>
                  
                </div>
                <FaChevronRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};