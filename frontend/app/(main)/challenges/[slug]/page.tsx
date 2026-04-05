"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchChallengeBySlugThunk } from "@/lib/store/features/challenge/challenge.actions";
import {
  FiArrowLeft, FiClock, FiAward, FiCheckCircle,
  FiChevronRight, FiLock, FiZap, FiLoader,
} from "react-icons/fi";
import Link from "next/link";
import { useEffect as useCountdownEffect, useState } from "react";

const DIFF = {
  EASY:   { pill: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500" },
  MEDIUM: { pill: "bg-amber-50 text-amber-700 border-amber-200",       bar: "bg-amber-500"   },
  HARD:   { pill: "bg-rose-50 text-rose-700 border-rose-200",          bar: "bg-rose-500"    },
};

function Countdown({ endTime }: { endTime?: string | Date }) {
  const [remaining, setRemaining] = useState("");
  useCountdownEffect(() => {
    if (!endTime) return;
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) { setRemaining("Contest Ended"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      if (h > 24) setRemaining(`${Math.floor(h / 24)}d ${h % 24}h remaining`);
      else setRemaining(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} remaining`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return <span className="font-mono">{remaining}</span>;
}

export default function ChallengeDetailsPage() {
  const { slug } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentChallenge, isLoading, error } = useSelector((state: RootState) => state.challenge);

  useEffect(() => {
    if (slug) dispatch(fetchChallengeBySlugThunk(slug as string));
  }, [dispatch, slug]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <FiLoader className="animate-spin text-slate-300" size={36} />
    </div>
  );

  if (error || !currentChallenge) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-center p-10">
      <div>
        <p className="text-slate-400 font-bold uppercase text-sm tracking-widest">Challenge not found</p>
        <Link href="/challenges" className="text-[10px] font-bold uppercase mt-4 block text-slate-400 underline">Back to Challenges</Link>
      </div>
    </div>
  );

  const stats = currentChallenge.stats || { solvedCount: 0, totalCount: 0, percentage: 0 };
  const isCompleted = stats.solvedCount > 0 && stats.solvedCount === stats.totalCount;
  const diffKey = (currentChallenge.difficulty?.toUpperCase() || "MEDIUM") as keyof typeof DIFF;
  const cfg = DIFF[diffKey] || DIFF.MEDIUM;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Back */}
        <Link href="/challenges" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 mb-8 transition-all">
          <FiArrowLeft size={13} /> All Challenges
        </Link>

        {/* Hero card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-violet-500" />
          <div className="p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider ${cfg.pill}`}>
                  {currentChallenge.difficulty}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                  <FiAward size={10} /> {currentChallenge.points} bonus pts
                </span>
                {isCompleted && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <FiCheckCircle size={10} /> Completed
                  </span>
                )}
              </div>
              {currentChallenge.endTime && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 shrink-0 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <FiClock size={11} className="text-slate-400" />
                  <Countdown endTime={currentChallenge.endTime} />
                </div>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-3">
              {currentChallenge.title}
            </h1>
            {currentChallenge.description && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{currentChallenge.description}</p>
            )}
          </div>
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Your Progress</p>
              <p className="text-2xl font-black text-slate-900">
                {stats.percentage.toFixed(0)}%
                <span className="text-slate-300 text-lg ml-2">complete</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900">{stats.solvedCount}<span className="text-slate-300 text-lg">/{stats.totalCount}</span></p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">problems solved</p>
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? "bg-emerald-500" : cfg.bar}`}
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
          {isCompleted && (
            <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-lg px-4 py-3 border border-emerald-100">
              <FiZap size={14} />
              <span className="text-[11px] font-black uppercase tracking-wider">
                Challenge complete! +{currentChallenge.points} bonus XP earned
              </span>
            </div>
          )}
        </div>

        {/* Problems */}
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">
            Problems — {currentChallenge.problems?.length || 0} tasks
          </p>

          {currentChallenge.problems?.length ? (
            currentChallenge.problems.map((cp: any, index: number) => {
              const probDiffKey = (cp.problem.difficulty?.toUpperCase() || "MEDIUM") as keyof typeof DIFF;
              const probCfg = DIFF[probDiffKey] || DIFF.MEDIUM;
              return (
                <div
                  key={cp.problemId}
                  onClick={() => router.push(`/problems/${cp.problem.problemId}?challenge=${currentChallenge.slug}`)}
                  className={`group bg-white border rounded-xl p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${
                    cp.isSolved ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Number / check */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      cp.isSolved ? "bg-emerald-100" : "bg-slate-100 group-hover:bg-slate-200 transition-colors"
                    }`}>
                      {cp.isSolved
                        ? <FiCheckCircle size={18} className="text-emerald-600" />
                        : <span className="text-sm font-black text-slate-500">{String(index + 1).padStart(2, "0")}</span>}
                    </div>

                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm transition-colors truncate ${
                        cp.isSolved ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 group-hover:text-blue-600"
                      }`}>
                        {cp.problem.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider ${probCfg.pill}`}>
                          {cp.problem.difficulty}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          {cp.problem.points || 50} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <button className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                    cp.isSolved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-900 text-white group-hover:bg-blue-600"
                  }`}>
                    {cp.isSolved ? "Done" : "Solve"} <FiChevronRight size={10} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 py-16 text-center">
              <FiLock size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No problems yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
