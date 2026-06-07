"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiAward, FiChevronRight, FiClock, FiCheckCircle, FiZap } from "react-icons/fi";
import { Challenge } from "@/types/challenge.types";

interface ChallengeCardProps {
  challenge: Challenge;
}

const DIFF = {
  EASY:   { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", accent: "border-l-emerald-500" },
  MEDIUM: { pill: "bg-amber-50 text-amber-700 border-amber-200",       bar: "bg-amber-500",   accent: "border-l-amber-500"   },
  HARD:   { pill: "bg-rose-50 text-rose-700 border-rose-200",          bar: "bg-rose-500",    accent: "border-l-rose-500"    },
};

function useCountdown(endTime?: string | Date) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Ended"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 24) setRemaining(`${Math.floor(h / 24)}d ${h % 24}h`);
      else setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return remaining;
}

export const ChallengeCard = ({ challenge }: ChallengeCardProps) => {
  const router = useRouter();
  const countdown = useCountdown(challenge.endTime);
  const diffKey = (challenge.difficulty?.toUpperCase() || "MEDIUM") as keyof typeof DIFF;
  const cfg = DIFF[diffKey] || DIFF.MEDIUM;
  const stats = (challenge as any).stats;
  const isCompleted = stats?.isCompleted;
  const pct = stats?.percentage ?? 0;
  const totalProblems = challenge._count?.problems ?? stats?.totalCount ?? 0;

  return (
    <div
      onClick={() => router.push(`/challenges/${challenge.slug}`)}
      className={`group bg-white border border-slate-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-200 flex flex-col gap-4 relative overflow-hidden border-l-4 ${cfg.accent}`}
    >
      {/* Completed overlay badge */}
      {isCompleted && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
          <FiCheckCircle size={10} /> Completed
        </div>
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider ${cfg.pill}`}>
            {challenge.difficulty}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
            <FiAward size={10} /> {challenge.points} pts
          </span>
        </div>
        {countdown && countdown !== "Ended" && (
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 shrink-0">
            <FiClock size={11} className="text-slate-400" />
            <span className="font-mono">{countdown}</span>
          </div>
        )}
      </div>

      {/* Title + description */}
      <div>
        <h3 className="text-base font-black uppercase italic tracking-tight text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
          {challenge.title}
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
          {challenge.description || "Master complex algorithmic patterns in this curated challenge."}
        </p>
      </div>

      {/* Progress bar (only if user has started) */}
      {stats && pct > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
            <span className={`text-[9px] font-black ${isCompleted ? "text-emerald-600" : "text-slate-500"}`}>
              {stats.solvedCount}/{stats.totalCount}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${isCompleted ? "bg-emerald-500" : cfg.bar}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <FiZap size={11} />
          <span>{totalProblems} problem{totalProblems !== 1 ? "s" : ""}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); router.push(`/challenges/${challenge.slug}`); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
            isCompleted
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-slate-900 text-white hover:bg-slate-700"
          }`}
        >
          {isCompleted ? "Review" : "Solve"} <FiChevronRight size={10} />
        </button>
      </div>
    </div>
  );
};
