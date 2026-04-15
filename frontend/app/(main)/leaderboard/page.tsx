"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  FiClock, FiCpu, FiRefreshCw, FiLoader, FiAward,
  FiCalendar, FiStar, FiSearch, FiX, FiCode,
} from "react-icons/fi";
import { MdOutlineLeaderboard } from "react-icons/md";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";

type Tab = "points" | "efficiency";
type Period = "weekly" | "monthly";
type Metric = "runtime" | "memory";

const RANK_STYLES = [
  "bg-amber-400 text-white",
  "bg-slate-400 text-white",
  "bg-orange-400 text-white",
];

// ─── Problem search ───────────────────────────────────────────────────────────
function ProblemSearch({ onSelect }: { onSelect: (p: any) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await api.get("/search", { params: { q } });
      setResults(res.data.problems || []);
      setOpen(true);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 300);
  };

  const DIFF_COLOR: Record<string, string> = {
    EASY: "text-emerald-600 bg-emerald-50",
    MEDIUM: "text-amber-600 bg-amber-50",
    HARD: "text-rose-600 bg-rose-50",
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 rounded-sm focus-within:border-primary-1 transition-all">
        <FiSearch size={14} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search a problem to compare efficiency..."
          className="flex-1 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
        />
        {loading && <FiLoader size={13} className="animate-spin text-slate-400 shrink-0" />}
        {!loading && query && (
          <button onClick={() => { setQuery(""); setResults([]); setOpen(false); }}>
            <FiX size={13} className="text-slate-400 hover:text-slate-700" />
          </button>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white border-2 border-slate-100 rounded-sm shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto">
          {results.map((p: any) => (
            <button key={p.problemId}
              onClick={() => { onSelect(p); setQuery(p.title); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 group"
            >
              <span className="text-[12px] font-bold text-slate-800 group-hover:text-primary-1 transition-colors truncate">{p.title}</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ml-3 shrink-0 ${DIFF_COLOR[p.difficulty] || "text-slate-500 bg-slate-100"}`}>
                {p.difficulty}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("points");

  // Points state
  const [pointsData, setPointsData] = useState<any>(null);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("weekly");

  // Efficiency state
  const [selectedProblem, setSelectedProblem] = useState<any>(null);
  const [metric, setMetric] = useState<Metric>("runtime");
  const [languageId, setLanguageId] = useState<number | null>(null);
  const [effData, setEffData] = useState<any>(null);
  const [effLoading, setEffLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch points leaderboard
  const fetchPoints = useCallback(async (silent = false) => {
    if (!silent) setPointsLoading(true);
    else setRefreshing(true);
    try {
      const res = await api.get("/leaderboard", { params: { period, type: "points" } });
      setPointsData(res.data);
      setLastUpdated(new Date());
    } catch { }
    finally { setPointsLoading(false); setRefreshing(false); }
  }, [period]);

  // Fetch per-problem efficiency
  const fetchEfficiency = useCallback(async () => {
    if (!selectedProblem) return;
    setEffLoading(true);
    try {
      const params: any = { metric };
      if (languageId) params.languageId = languageId;
      const res = await api.get(`/leaderboard/problem/${selectedProblem.problemId}`, { params });
      setEffData(res.data);
      setLastUpdated(new Date());
    } catch { }
    finally { setEffLoading(false); }
  }, [selectedProblem, metric, languageId]);

  useEffect(() => { if (tab === "points") fetchPoints(); }, [fetchPoints, tab]);
  useEffect(() => { if (tab === "efficiency") fetchEfficiency(); }, [fetchEfficiency, tab]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === "points") fetchPoints(true);
      else if (tab === "efficiency" && selectedProblem) fetchEfficiency();
    }, 30_000);
    return () => clearInterval(interval);
  }, [tab, fetchPoints, fetchEfficiency, selectedProblem]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-2">Rankings</p>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-slate-900">
                Leaderboard
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0 mt-2">
              {lastUpdated && (
                <span className="hidden md:block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => tab === "points" ? fetchPoints(true) : fetchEfficiency()}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-colors border-2 border-slate-200 rounded-sm px-3 py-2 bg-white hover:border-slate-400"
              >
                <FiRefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-8 border-2 border-slate-100 rounded-sm p-1 w-fit bg-slate-50">
            <button
              onClick={() => setTab("points")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all ${tab === "points" ? "bg-white text-amber-600 shadow-sm border-2 border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
            >
              <FiStar size={12} /> XP Rankings
            </button>
            <button
              onClick={() => setTab("efficiency")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all ${tab === "efficiency" ? "bg-white text-blue-600 shadow-sm border-2 border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
            >
              <FiClock size={12} /> Problem Efficiency
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Points Tab ── */}
        {tab === "points" && (
          <>
            {/* Period selector */}
            <div className="flex items-center gap-2 mb-6">
              {(["weekly", "monthly"] as Period[]).map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-[11px] font-black uppercase tracking-widest border-2 transition-all ${period === p ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"}`}
                >
                  <FiCalendar size={11} />
                  {p === "weekly" ? "This Week" : "This Month"}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Live</span>
              </div>
            </div>

            {pointsLoading ? (
              <div className="flex items-center justify-center py-24">
                <FiLoader className="animate-spin text-slate-300" size={32} />
              </div>
            ) : !pointsData?.rankings?.length ? (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-sm">
                <MdOutlineLeaderboard size={36} className="text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No data yet for this period</p>
                <p className="text-[11px] text-slate-300 mt-1">Solve problems to appear on the leaderboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Top 3 podium */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  {([1, 0, 2] as number[]).map((podiumIdx) => {
                    const entry = pointsData.rankings[podiumIdx];
                    if (!entry) return <div key={podiumIdx} />;
                    return (
                      <Link key={entry.userId} href={`/u/${entry.userId}`}
                        className={`bg-white border-2 rounded-sm p-5 text-center hover:shadow-md transition-all ${podiumIdx === 0 ? "border-amber-200 md:order-2" : podiumIdx === 1 ? "border-slate-100 md:order-1" : "border-orange-100 md:order-3"}`}
                      >
                        <div className={`w-9 h-9 rounded-sm flex items-center justify-center text-[11px] font-black mx-auto mb-3 ${RANK_STYLES[podiumIdx] || "bg-slate-100 text-slate-500"}`}>
                          {podiumIdx === 0 ? <FiAward size={16} /> : `#${entry.rank}`}
                        </div>
                        <div className="w-12 h-12 rounded-sm bg-slate-100 overflow-hidden mx-auto mb-2 border-2 border-slate-200">
                          {entry.avatar
                            ? <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg font-black text-slate-400">{entry.fullName?.[0]}</div>}
                        </div>
                        <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tight">{entry.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold">@{entry.username}</p>
                        <p className="mt-3 text-2xl font-black text-amber-600">{entry.totalValue.toLocaleString()}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">XP Points</p>
                      </Link>
                    );
                  })}
                </div>

                {/* Full table */}
                <div className="border-2 border-slate-100 rounded-sm overflow-hidden">
                  <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b-2 border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                    <div className="col-span-1">#</div>
                    <div className="col-span-6">User</div>
                    <div className="col-span-2 text-center">Level</div>
                    <div className="col-span-3 text-right">XP</div>
                  </div>
                  {pointsData.rankings.map((entry: any) => (
                    <Link key={entry.userId} href={`/u/${entry.userId}`}
                      className="grid grid-cols-12 px-5 py-3.5 border-b-2 border-slate-50 last:border-0 hover:bg-slate-50 transition-colors items-center group"
                    >
                      <div className="col-span-1">
                        <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-black ${entry.rank <= 3 ? RANK_STYLES[entry.rank - 1] : "bg-slate-100 text-slate-500"}`}>
                          {entry.rank === 1 ? <FiAward size={12} /> : entry.rank}
                        </div>
                      </div>
                      <div className="col-span-6 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-sm bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-200">
                          {entry.avatar
                            ? <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-400">{entry.fullName?.[0]}</div>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-black text-slate-800 group-hover:text-primary-1 transition-colors truncate uppercase tracking-tight">{entry.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">@{entry.username}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="text-[10px] font-black text-primary-1 bg-primary-1/10 px-2 py-0.5 rounded-sm">Lv.{entry.level}</span>
                      </div>
                      <div className="col-span-3 text-right">
                        <span className="text-sm font-black text-amber-600">{entry.totalValue.toLocaleString()}</span>
                        <span className="text-[9px] text-slate-400 font-bold ml-1">xp</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-6">
              Rankings based on XP earned from solving problems this period
            </p>
          </>
        )}

        {/* ── Efficiency Tab ── */}
        {tab === "efficiency" && (
          <>
            {/* Explanation banner */}
            <div className="bg-blue-50 border-2 border-blue-100 rounded-sm px-5 py-4 mb-6 flex items-start gap-3">
              <FiCode size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-black text-blue-800 uppercase tracking-wide mb-1">Per-Problem Efficiency Rankings</p>
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Runtime and memory comparisons are only valid for the <strong>same problem</strong>. Pick a problem below to see who solved it fastest or most efficiently — filtered by language for a fair comparison.
                </p>
              </div>
            </div>

            {/* Problem search */}
            <div className="mb-5">
              <ProblemSearch onSelect={(p) => { setSelectedProblem(p); setEffData(null); }} />
            </div>

            {selectedProblem && (
              <>
                {/* Controls */}
                <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-slate-50 border-2 border-slate-100 rounded-sm">
                  {/* Problem info */}
                  <div className="flex items-center gap-2 mr-auto">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problem:</span>
                    <span className="text-[12px] font-black text-slate-900 uppercase tracking-tight">{selectedProblem.title}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${
                      selectedProblem.difficulty === "EASY" ? "text-emerald-600 bg-emerald-50" :
                      selectedProblem.difficulty === "MEDIUM" ? "text-amber-600 bg-amber-50" :
                      "text-rose-600 bg-rose-50"
                    }`}>{selectedProblem.difficulty}</span>
                  </div>

                  {/* Metric toggle */}
                  <div className="flex items-center gap-1 bg-white border-2 border-slate-200 rounded-sm p-1">
                    <button onClick={() => setMetric("runtime")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${metric === "runtime" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <FiClock size={11} /> Runtime
                    </button>
                    <button onClick={() => setMetric("memory")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${metric === "memory" ? "bg-violet-600 text-white" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <FiCpu size={11} /> Memory
                    </button>
                  </div>

                  {/* Language filter */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lang:</span>
                    <button onClick={() => setLanguageId(null)}
                      className={`px-2.5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider border-2 transition-all ${!languageId ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"}`}
                    >
                      All
                    </button>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button key={l.judge0Id} onClick={() => setLanguageId(l.judge0Id)}
                        className={`px-2.5 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider border-2 transition-all ${languageId === l.judge0Id ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-500 hover:border-slate-400 bg-white"}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results */}
                {effLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <FiLoader className="animate-spin text-slate-300" size={28} />
                  </div>
                ) : !effData?.rankings?.length ? (
                  <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No accepted submissions yet for this problem</p>
                  </div>
                ) : (
                  <div className="border-2 border-slate-100 rounded-sm overflow-hidden">
                    <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b-2 border-slate-100 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                      <div className="col-span-1">#</div>
                      <div className="col-span-5">User</div>
                      <div className="col-span-3">Language</div>
                      <div className="col-span-3 text-right">{metric === "runtime" ? "Runtime" : "Memory"}</div>
                    </div>
                    {effData.rankings.map((entry: any) => (
                      <Link key={`${entry.userId}-${entry.languageId}`} href={`/u/${entry.userId}`}
                        className="grid grid-cols-12 px-5 py-3.5 border-b-2 border-slate-50 last:border-0 hover:bg-slate-50 transition-colors items-center group"
                      >
                        <div className="col-span-1">
                          <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-black ${entry.rank <= 3 ? RANK_STYLES[entry.rank - 1] : "bg-slate-100 text-slate-500"}`}>
                            {entry.rank === 1 ? <FiAward size={12} /> : entry.rank}
                          </div>
                        </div>
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-sm bg-slate-100 overflow-hidden shrink-0 border-2 border-slate-200">
                            {entry.avatar
                              ? <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-sm font-black text-slate-400">{entry.fullName?.[0]}</div>}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-black text-slate-800 group-hover:text-primary-1 transition-colors truncate uppercase tracking-tight">{entry.fullName}</p>
                            <p className="text-[10px] text-slate-400 font-bold">@{entry.username}</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                            {entry.languageName}
                          </span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className={`text-sm font-black ${metric === "runtime" ? "text-blue-600" : "text-violet-600"}`}>
                            {entry.value}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-4">
                  Best accepted submission per user · Same problem · {languageId ? effData?.languageName : "All languages shown"}
                </p>
              </>
            )}

            {!selectedProblem && (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-sm">
                <FiSearch size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Search for a problem above to see efficiency rankings</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
