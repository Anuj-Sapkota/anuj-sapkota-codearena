"use client";

import { Problem } from "@/types/problem.types";
import { useRouter } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

const DIFF_STYLE: Record<string, string> = {
  EASY:   "text-emerald-600 bg-emerald-50",
  MEDIUM: "text-amber-600 bg-amber-50",
  HARD:   "text-rose-600 bg-rose-50",
};

const STATUS_STYLE: Record<string, { dot: string; label: string }> = {
  SOLVED:    { dot: "bg-emerald-500", label: "Solved" },
  ATTEMPTED: { dot: "bg-amber-400",   label: "Attempted" },
  UNSOLVED:  { dot: "bg-slate-200",   label: "—" },
};

interface ProblemListItemProps {
  prob: Problem;
  idx: number;
}

export default function ProblemListItem({ prob, idx }: ProblemListItemProps) {
  const router = useRouter();
  const status = STATUS_STYLE[prob.status ?? "UNSOLVED"] ?? STATUS_STYLE.UNSOLVED;
  const diff = DIFF_STYLE[prob.difficulty] ?? "text-slate-500 bg-slate-100";

  return (
    <button
      onClick={() => router.push(`/problems/${prob.problemId}`)}
      className="w-full grid grid-cols-12 items-center px-5 py-4 border-b-2 border-slate-100 last:border-0 hover:bg-slate-50 transition-colors group text-left"
    >
      {/* # */}
      <div className="col-span-1">
        <span className="text-[11px] font-black text-slate-300 tabular-nums group-hover:text-slate-400 transition-colors">
          {String(idx + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Title */}
      <div className="col-span-5 min-w-0 pr-4">
        <span className="text-sm font-bold text-slate-800 group-hover:text-primary-1 transition-colors truncate block">
          {prob.title}
        </span>
      </div>

      {/* Difficulty */}
      <div className="col-span-2">
        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-sm ${diff}`}>
          {prob.difficulty}
        </span>
      </div>

      {/* Status */}
      <div className="col-span-2 flex items-center gap-2">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          {status.label}
        </span>
      </div>

      {/* XP */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <span className="text-[11px] font-black text-primary-1">
          {prob.points ?? 50}
        </span>
        <span className="text-[9px] font-black text-slate-400 uppercase">xp</span>
        <FiArrowRight
          size={12}
          className="text-slate-300 group-hover:text-primary-1 group-hover:translate-x-0.5 transition-all ml-1"
        />
      </div>
    </button>
  );
}
