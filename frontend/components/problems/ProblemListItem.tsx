"use client";

import { Problem } from "@/types/problem.types";

interface ProblemListItemProps {
  prob: Problem;
  idx: number;
}

export default function ProblemListItem({ prob, idx }: ProblemListItemProps) {
  // Logic moved here to keep the main page clean
  const getStatusInfo = (status: Problem["status"]) => {
    switch (status) {
      case "SOLVED":
        return { label: "Completed", color: "text-emerald-500" };
      case "ATTEMPTED":
        return { label: "Attempted", color: "text-orange-500" };
      default:
        return { label: "Awaiting", color: "text-slate-400" };
    }
  };

  const statusInfo = getStatusInfo(prob.status);

  return (
    <div
      className={`flex items-center justify-between p-8 rounded-md transition-all border-2 border-transparent hover:border-primary-1/40 hover:shadow-sm ${
        idx % 2 === 0 ? "bg-slate-50" : "bg-white border-slate-100"
      }`}
    >
      {/* Title and ID Info */}
      <div className="flex items-center gap-8">
        <span className="font-mono text-sm font-black text-slate-300">
          {(idx + 1).toString().padStart(2, "0")}
        </span>
        <div>
          <span className="font-black text-slate-900 uppercase text-lg block tracking-tight mb-1">
            {prob.title}
          </span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase">
            {prob.slug}
          </span>
        </div>
      </div>

      {/* Status, Difficulty, and Action */}
      <div className="flex items-center gap-12">
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Status
          </p>
          <span className={`text-[11px] font-black uppercase ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="text-right w-20">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            Level
          </p>
          <span className="text-[11px] font-black text-slate-900 uppercase">
            {prob.difficulty}
          </span>
        </div>

        <button className="px-8 py-3 border-2 border-primary-1 text-primary-1 text-[11px] font-black uppercase tracking-widest rounded hover:bg-primary-1 hover:text-white transition-all active:scale-95 shadow-sm">
          Solve
        </button>
      </div>
    </div>
  );
}