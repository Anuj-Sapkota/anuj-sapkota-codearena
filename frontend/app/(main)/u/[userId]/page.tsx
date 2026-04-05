"use client";

import React, { useEffect, useState, use } from "react";
import { Tooltip } from "react-tooltip";
import {
  Trophy, CheckCircle, Code, Loader2, History,
  BookOpen, ChevronRight, Flame, Award, X,
} from "lucide-react";
import Link from "next/link";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

import UserProfileSidebar from "@/components/profile/Sidebar";
import { StatCard, DifficultyCircle } from "@/components/profile/Stats";
import { ActivityHeatmap } from "@/components/profile/Activity";
import LanguageStats from "@/components/profile/LanguageStats";

type TabType = "submissions" | "challenges" | "resources";
type PageProps = { params: Promise<{ userId: string }> };

// ─── Badge Detail Modal ───────────────────────────────────────────────────────
function BadgeDetailModal({ badge, onClose }: { badge: any; onClose: () => void }) {
  const earnedDate = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-600" />
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={18} />
        </button>
        <div className="p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center overflow-hidden shadow-lg">
            {badge.iconUrl
              ? <img src={badge.iconUrl} alt={badge.name} className="w-full h-full object-cover" />
              : <Award size={40} className="text-amber-400" />}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider mb-3">
            <CheckCircle size={11} /> Badge Earned
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-1">{badge.name}</h2>
          <p className="text-xs text-slate-500 mb-4">{badge.description}</p>
          {earnedDate && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Earned on {earnedDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PublicProfile({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("submissions");
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (!userId || userId === "undefined") return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/user/profile/${userId}`);
        if (!response.ok) throw new Error("User profile not found");
        const profileData = await response.json();
        setData(profileData);

        // Fetch rank from leaderboard (public endpoint)
        try {
          const lbRes = await fetch(`${apiUrl}/leaderboard?period=weekly&type=points`);
          const lbData = await lbRes.json();
          const found = (lbData.rankings || []).find((r: any) => r.userId === Number(userId));
          setUserRank(found ? found.rank : null);
        } catch { /* rank is optional */ }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  if (error || !data)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
        Error: {error}
      </div>
    );

  const { user, stats, heatmapData, recentSubmissions, challenges, resources, badges } = data;
  console.log("STATA: ", stats);
  const totalSolved =
    (stats?.easy.solved || 0) + (stats?.medium.solved || 0) + (stats?.hard.solved || 0);

  const tabs = [
    {
      id: "submissions",
      label: "Recent Submissions",
      icon: <History size={16} />,
    },
    { id: "challenges", label: "Challenges", icon: <Trophy size={16} /> },
    { id: "resources", label: "My Resources", icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 md:p-8 font-sans">
      {selectedBadge && <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Column */}
        <div className="lg:col-span-3 space-y-6">
          <UserProfileSidebar user={{ ...user, rank: userRank }} />
          <LanguageStats languages={data.languageStats} />
        </div>

        {/* Main Content Column */}
        <div className="lg:col-span-9 space-y-6">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Solved"
              value={totalSolved}
              color="text-emerald-600"
              icon={<CheckCircle size={16} />}
            />
            <StatCard
              label="XP Points"
              value={user.xp || 0}
              color="text-blue-600"
              icon={<Flame size={16} />}
            />
            <StatCard
              label="Current Level"
              value={user.level || 1}
              color="text-violet-600"
              icon={<Code size={16} />}
            />
          </div>

          {/* Difficulty Breakdown */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-800 mb-8 font-bold text-lg">
              Solving Statistics
            </h3>
            <div className="flex flex-wrap justify-around gap-8">
              <DifficultyCircle
                label="Easy"
                count={stats?.easy?.solved} // Updated path
                total={stats?.easy?.total} // Updated path
                color="text-emerald-500"
                strokeColor="stroke-emerald-500"
              />
              <DifficultyCircle
                label="Medium"
                count={stats?.medium?.solved} // Updated path
                total={stats?.medium?.total} // Updated path
                color="text-amber-500"
                strokeColor="stroke-amber-500"
              />
              <DifficultyCircle
                label="Hard"
                count={stats?.hard?.solved} // Updated path
                total={stats?.hard?.total} // Updated path
                color="text-rose-500"
                strokeColor="stroke-rose-500"
              />
            </div>
          </div>

          {/* Heatmap Section - Assumes your ActivityHeatmap handles light backgrounds */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <ActivityHeatmap heatmapData={heatmapData} />
          </div>

          {/* Badges Section */}
          {badges?.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-slate-800 font-bold text-lg flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  Badges
                </h3>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {badges.length} earned
                </span>
              </div>
              <div className="flex flex-wrap gap-4">
                {badges.map((badge: any) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    data-tooltip-id="badge-tooltip"
                    data-tooltip-content={badge.name}
                    className="group relative w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-100 overflow-hidden hover:border-amber-400 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {badge.iconUrl
                      ? <img src={badge.iconUrl} alt={badge.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Award size={24} className="text-amber-400" />
                        </div>}
                    {/* Shine overlay on hover */}
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tabbed Activity Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? "text-blue-600 bg-white"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content Area */}
            <div className="p-2 bg-white">
              {activeTab === "submissions" && (
                <div className="divide-y divide-slate-100">
                  {recentSubmissions?.length > 0 ? (
                    recentSubmissions.map((s: any) => (
                      <Link key={s.id} href={`/problems/${s.problemId}`}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                            <CheckCircle size={13} className="text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors truncate">{s.title}</p>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    ))
                  ) : (
                    <EmptyState msg="No recent solutions found." />
                  )}
                </div>
              )}

              {activeTab === "challenges" && (
                <div className="divide-y divide-slate-100">
                  {challenges?.length > 0 ? (
                    challenges.map((c: any) => (
                      <Link key={c.id} href={`/challenges/${c.slug}`}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                            <Trophy size={13} className="text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors truncate">{c.title}</p>
                            <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                              {c.difficulty} Difficulty
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all shrink-0" />
                      </Link>
                    ))
                  ) : (
                    <EmptyState msg="You haven't participated in any challenges yet." />
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="divide-y divide-slate-100">
                  {resources?.length > 0 ? (
                    resources.map((r: any) => {
                      const pct = r.totalModules > 0 ? Math.round((r.completedModules / r.totalModules) * 100) : 0;
                      const isComplete = pct === 100;
                      return (
                        <Link key={r.id} href={`/resource/${r.id}`}
                          className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                        >
                          {/* Thumbnail */}
                          <div className="w-16 h-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {r.thumbnail
                              ? <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <BookOpen size={16} className="text-slate-400" />
                                </div>}
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors truncate">{r.title}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                              {/* Progress bar */}
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                                <div
                                  className={`h-full rounded-full transition-all ${isComplete ? "bg-emerald-500" : "bg-blue-400"}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${isComplete ? "text-emerald-600" : "text-slate-400"}`}>
                                {isComplete ? "Completed" : `${r.completedModules}/${r.totalModules} lessons`}
                              </span>
                            </div>
                          </div>
                          {isComplete
                            ? <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                            : <ChevronRight size={15} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all shrink-0" />}
                        </Link>
                      );
                    })
                  ) : (
                    <EmptyState msg="No purchased resources found." />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tooltip
        id="heatmap-tooltip"
        style={{ backgroundColor: "#1e293b", color: "#f8fafc" }}
      />
      <Tooltip
        id="badge-tooltip"
        style={{ backgroundColor: "#1e293b", color: "#f8fafc", fontSize: "11px", fontWeight: "bold" }}
      />
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="py-12 text-center text-slate-400 text-sm italic font-medium">
      {msg}
    </div>
  );
}
