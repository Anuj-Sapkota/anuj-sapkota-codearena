"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  FiClock, FiCpu, FiRefreshCw, FiLoader, FiAward,
  FiCalendar, FiStar,
} from "react-icons/fi";
import { MdOutlineLeaderboard } from "react-icons/md";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";

type LeaderboardType = "points" | "runtime" | "memory";
type Period = "weekly" | "monthly";

const TYPE_CONFIG: Record<LeaderboardType, { label: string; icon: React.ReactNode; color: string; unit: string; desc: string }> = {
  points:  { label: "Points",  icon: <FiStar size={11} />,    color: "text-amber-600",  unit: "pts", desc: "Most XP earned" },
  runtime: { label: "Runtime", icon: <FiClock size={11} />,   color: "text-blue-600",   unit: "ms",  desc: "Lowest total execution time" },
  memory:  { label: "Memory",  icon: <FiCpu size={11} />,     color: "text-violet-600", unit: "KB",  desc: "Lowest total memory usage" },
};

const RANK_STYLES = [
  "bg-amber-400 text-white",
  "bg-slate-400 text-white",
  "bg-orange-400 text-white",
];

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [period, setPeriod] = useState<Period>("weekly");
  const [type, setType] = useState<LeaderboardType>("points");
  const [languageId, setLanguageId] = useState<number | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params: any = { period, type };
      if (languageId && type !== "points") params.languageId = languageId;
      const res = await api.get("/leaderboard", { params });
      setData(res.data);
      setLastUpdated(new Date());
    } catch { /* silent fail */ }
    finally { setLoading(false); setRefreshing(false); }
  }, [period, type, languageId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(() => fetchData(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const cfg = TYPE_CONFIG[type];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-5xl mx-auto py-10 px-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <MdOutlineLeaderboard size={28} className="text-blue-600" />
              <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Leaderboard</h1>
            </div>
            <p className="text-slate-500 text-sm">{cfg.desc} — per language, fair and square.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {lastUpdated && (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button onClick={() => fetchData(true)} disabled={refreshing}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-colors border border-slate-200 rounded-lg px-3 py-2 bg-white hover:border-slate-400"
            >
              <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Period */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {(["weekly", "monthly"] as Period[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <FiCalendar size={11} />
                  {p === "weekly" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>

            {/* Type */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              {(Object.entries(TYPE_CONFIG) as [LeaderboardType, typeof TYPE_CONFIG[LeaderboardType]][]).map(([t, c]) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-wider transition-all ${type === t ? `bg-white ${c.color} shadow-sm` : "text-slate-500 hover:text-slate-700"}`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language filter — only shown for runtime/memory */}
          {type !== "points" && (
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Language:</span>
              <button onClick={() => setLanguageId(null)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${!languageId ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"}`}
              >
                All
              </button>
              {SUPPORTED_LANGUAGES.map((l) => (
                <button key={l.judge0Id} onClick={() => setLanguageId(l.judge0Id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${languageId === l.judge0Id ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Live — refreshes every 30s</span>
          {data && (
            <span className="text-[10px] text-slate-400 font-bold ml-2">
              {type !== "points" && data.languageName + " · "}
              {period === "weekly" ? "This Week" : "This Month"}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="animate-spin text-slate-300" size={32} />
          </div>
        ) : !data?.rankings?.length ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
            <MdOutlineLeaderboard size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No data yet for this period</p>
            <p className="text-slate-300 text-xs mt-1">Solve problems to appear on the leaderboard</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              {([1, 0, 2] as number[]).map((podiumIdx) => {
                const entry = data.rankings[podiumIdx];
                if (!entry) return <div key={podiumIdx} />;
                return (
                  <Link key={entry.userId} href={`/u/${entry.userId}`}
                    className={`bg-white rounded-xl border-2 p-5 text-center hover:shadow-md transition-all ${podiumIdx === 0 ? "border-amber-300 md:order-2" : podiumIdx === 1 ? "border-slate-200 md:order-1" : "border-orange-200 md:order-3"}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mx-auto mb-3 shadow-md ${RANK_STYLES[podiumIdx] || "bg-slate-100 text-slate-500"}`}>
                      {podiumIdx === 0 ? <FiAward size={18} /> : `#${entry.rank}`}
                    </div>
                    <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden mx-auto mb-2 border-2 border-slate-200">
                      {entry.avatar
                        ? <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-400">{entry.fullName[0]}</div>}
                    </div>
                    <p className="font-black text-slate-900 text-sm truncate">{entry.fullName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">@{entry.username}</p>
                    <div className={`mt-3 flex items-center justify-center gap-1.5 font-black text-xl ${cfg.color}`}>
                      {cfg.icon} {entry.totalValue}{entry.unit}
                    </div>
                    {type !== "points" && (
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">{entry.problemsSolved} problems</p>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Full table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                <div className="col-span-1">Rank</div>
                <div className="col-span-5">User</div>
                <div className="col-span-2 text-center">{type === "points" ? "Level" : "Problems"}</div>
                <div className="col-span-2 text-center">Level</div>
                <div className="col-span-2 text-right">{cfg.label}</div>
              </div>
              {data.rankings.map((entry: any) => (
                <Link key={entry.userId} href={`/u/${entry.userId}`}
                  className="grid grid-cols-12 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors items-center group"
                >
                  <div className="col-span-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black ${entry.rank <= 3 ? RANK_STYLES[entry.rank - 1] : "bg-slate-100 text-slate-500"}`}>
                      {entry.rank === 1 ? <FiAward size={12} /> : entry.rank}
                    </div>
                  </div>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {entry.avatar
                        ? <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-400">{entry.fullName[0]}</div>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{entry.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">@{entry.username}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-black text-slate-700">
                      {type === "points" ? `Lv.${entry.level}` : entry.problemsSolved}
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-[10px] font-black text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Lv.{entry.level}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-black ${cfg.color}`}>{entry.totalValue}{entry.unit}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-6">
          {type === "points"
            ? "Rankings based on XP earned from solving problems this period"
            : "Rankings based on sum of best accepted submissions per problem · Language-separated for fairness"}
        </p>
      </div>
    </div>
  );
}
