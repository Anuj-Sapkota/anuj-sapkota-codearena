"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import { setSelectedSubmission, setDescriptionTab } from "@/lib/store/features/workspace/workspace.slice";
import { SubmissionRecord } from "@/types/workspace.types";
// Importing from React Icons
import { FaCheckCircle, FaTimesCircle, FaChevronRight } from "react-icons/fa";
import { MdHistory, MdAccessTime, MdMemory } from "react-icons/md";

export const SubmissionList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { submissions, isFetchingHistory } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleSelectSubmission = (submission: SubmissionRecord) => {
    dispatch(setSelectedSubmission(submission));
    dispatch(setDescriptionTab("detail"));
  };

  if (isFetchingHistory) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <MdHistory className="text-5xl mb-4 opacity-20" />
        <p className="font-mono text-[10px] uppercase tracking-widest">No_Submissions_Found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <MdHistory className="text-sm" /> History_Log ({submissions.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {submissions.map((sub: SubmissionRecord) => (
          <button
            key={sub.id}
            onClick={() => handleSelectSubmission(sub)}
            className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center gap-4">
              {/* Conditional Icon Rendering */}
              {sub.status === "ACCEPTED" ? (
                <FaCheckCircle className="text-xl text-emerald-500" />
              ) : (
                <FaTimesCircle className="text-xl text-red-500" />
              )}
              
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase italic ${
                    sub.status === "ACCEPTED" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {sub.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    • {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex gap-4 mt-1.5">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <MdAccessTime className="text-xs" /> 
                    {(sub.time ? sub.time * 1000 : 0).toFixed(0)}ms
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <MdMemory className="text-xs" /> 
                    {(sub.memory ? sub.memory / 1024 : 0).toFixed(1)}MB
                  </span>
                </div>
              </div>
            </div>

            <FaChevronRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};