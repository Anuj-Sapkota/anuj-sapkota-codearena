"use client";

import { Problem } from "@/types/problem.types";
import { useRouter } from "next/navigation";

interface ProblemListItemProps {
  prob: Problem;
  idx: number;
}

export default function ProblemListItem({ prob, idx }: ProblemListItemProps) {
  const router = useRouter();

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

  // REDIRECT TO /problems/[id]
  const handleSolveRedirect = () => {
    // Navigating to the dynamic ID route under problems
    router.push(`/problems/${prob.problemId}`);
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 rounded-md transition-all border-2 border-transparent hover:border-primary-1/40 hover:shadow-sm ${idx % 2 === 0 ? "bg-slate-50" : "bg-white border-slate-100"}`}>
      
      <div className="flex items-center gap-4 md:gap-8 mb-4 sm:mb-0">
        <span className="font-mono text-sm font-black text-slate-300 hidden md:block">
          {(idx + 1).toString().padStart(2, "0")}
        </span>
        <div>
          <span className="font-black text-slate-900 uppercase text-base md:text-lg block tracking-tight mb-1">
            {prob.title}
          </span>
          <span className="text-[9px] md:text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase">
            ID: {prob.problemId}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-12 border-t sm:border-t-0 pt-4 sm:pt-0">
        <div className="text-left sm:text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
          <span className={`text-[10px] md:text-[11px] font-black uppercase ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        
        <div className="text-left sm:text-right w-16 md:w-20">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</p>
          <span className="text-[10px] md:text-[11px] font-black text-slate-900 uppercase">
            {prob.difficulty}
          </span>
        </div>

        <button 
          onClick={handleSolveRedirect}
          className="px-6 md:px-8 py-2.5 md:py-3 border-2 border-primary-1 text-primary-1 text-[10px] md:text-[11px] font-black uppercase tracking-widest rounded hover:bg-primary-1 hover:text-white transition-all active:scale-95"
        >
          Solve_
        </button>
      </div>
    </div>
  );
}