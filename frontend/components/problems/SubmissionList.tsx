"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import { setSelectedSubmission, setDescriptionTab } from "@/lib/store/features/workspace/workspace.slice";
import { SubmissionRecord } from "@/types/workspace.types";
import { FiClock, FiCpu, FiChevronRight } from "react-icons/fi";
import { MdHistory } from "react-icons/md";

const LANG_LABELS: Record<number, string> = { 63: "JS", 71: "PY", 62: "Java", 54: "C++" };

const STATUS_STYLES: Record<string, { text: string; dot: string; label: string }> = {
  ACCEPTED:          { text: "text-emerald-600", dot: "bg-emerald-500", label: "Accepted" },
  WRONG_ANSWER:      { text: "text-red-500",     dot: "bg-red-500",     label: "Wrong Answer" },
  COMPILATION_ERROR: { text: "text-amber-500",   dot: "bg-amber-500",   label: "Compile Error" },
  RUNTIME_ERROR:     { text: "text-orange-500",  dot: "bg-orange-500",  label: "Runtime Error" },
  TIME_LIMIT_EXCEEDED:{ text: "text-purple-500", dot: "bg-purple-500",  label: "Time Limit" },
};

function getStatus(s: string) {
  return STATUS_STYLES[s] ?? { text: "text-slate-500", dot: "bg-slate-400", label: s.replace(/_/g, " ") };
}

export const SubmissionList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { submissions, isFetchingHistory } = useSelector((state: RootState) => state.workspace);

  const handleSelect = (sub: SubmissionRecord) => {
    dispatch(setSelectedSubmission(sub));
    dispatch(setDescriptionTab("detail"));
  };

  if (isFetchingHistory) {
    return (
      <div className="space-y-2 pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!submissions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300">
        <MdHistory size={40} className="mb-3 opacity-30" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_80px_80px_60px_24px] gap-2 px-3 pb-2 border-b border-slate-100">
        {["Status", "Runtime", "Memory", "Lang", ""].map((h) => (
          <span key={h} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</span>
        ))}
      </div>

      {submissions.map((sub) => {
        const st = getStatus(sub.status);
        const isAccepted = sub.status === "ACCEPTED";
        const date = new Date(sub.createdAt).toLocaleDateString(undefined, {
          month: "short", day: "numeric",
        });

        return (
          <button
            key={sub.id}
            onClick={() => handleSelect(sub)}
            className="w-full grid grid-cols-[1fr_80px_80px_60px_24px] gap-2 items-center px-3 py-3 rounded hover:bg-slate-50 transition-colors text-left group"
          >
            {/* Status */}
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
              <div className="min-w-0">
                <p className={`text-[11px] font-black truncate ${st.text}`}>{st.label}</p>
                <p className="text-[10px] text-slate-400">{date}</p>
              </div>
            </div>

            {/* Runtime */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
              <FiClock size={10} className="text-slate-300 shrink-0" />
              {isAccepted && sub.time != null
                ? `${(sub.time * 1000).toFixed(0)} ms`
                : <span className="text-slate-300">—</span>}
            </div>

            {/* Memory */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-600">
              <FiCpu size={10} className="text-slate-300 shrink-0" />
              {isAccepted && sub.memory != null
                ? `${(sub.memory / 1024).toFixed(1)} MB`
                : <span className="text-slate-300">—</span>}
            </div>

            {/* Language */}
            <span className="text-[10px] font-black text-slate-400 font-mono">
              {LANG_LABELS[sub.languageId] ?? sub.languageId}
            </span>

            {/* Arrow */}
            <FiChevronRight size={13} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
          </button>
        );
      })}
    </div>
  );
};
