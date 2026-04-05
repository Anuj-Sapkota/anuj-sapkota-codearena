"use client";

import { useState } from "react";
import { usePublicChallenges } from "@/hooks/useChallenges";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { FiLoader, FiZap } from "react-icons/fi";
import { MdOutlineLeaderboard } from "react-icons/md";

const DIFF_FILTERS = ["ALL", "EASY", "MEDIUM", "HARD"] as const;

export default function ChallengesPage() {
  const { data: items = [], isLoading } = usePublicChallenges();
  const [filter, setFilter] = useState<typeof DIFF_FILTERS[number]>("ALL");

  const filtered = filter === "ALL" ? items : items.filter((c: any) => c.difficulty === filter);
  const completedCount = items.filter((c: any) => c.stats?.isCompleted).length;

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-6xl mx-auto py-10 px-6">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MdOutlineLeaderboard size={26} className="text-blue-600" />
              <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Challenges</h1>
            </div>
            <p className="text-slate-500 text-sm">Live algorithmic contests — solve all problems to earn bonus XP.</p>
          </div>
          {completedCount > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 shrink-0">
              <FiZap size={14} className="text-emerald-600" />
              <span className="text-[11px] font-black text-emerald-700 uppercase tracking-wider">{completedCount} Completed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {DIFF_FILTERS.map((d) => (
            <button key={d} onClick={() => setFilter(d)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${filter === d ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
              {d === "ALL" ? "All" : d}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24"><FiLoader className="animate-spin text-slate-300" size={32} /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((c: any) => <ChallengeCard key={c.challengeId} challenge={c} />)}
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 py-20 text-center">
            <MdOutlineLeaderboard size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No active challenges</p>
          </div>
        )}
      </div>
    </div>
  );
}
