"use client";

import React, { useEffect, useState, use } from "react";
import { Tooltip } from "react-tooltip";
import {
  Trophy,
  CheckCircle,
  Code,
  Loader2,
  History,
  BookOpen,
  ChevronRight,
  Flame,
} from "lucide-react";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

// Components
import UserProfileSidebar from "@/components/profile/Sidebar";
import { StatCard, DifficultyCircle } from "@/components/profile/Stats";
import { ActivityHeatmap } from "@/components/profile/Activity";
import LanguageStats from "@/components/profile/LanguageStats";

type TabType = "submissions" | "challenges" | "resources";

type PageProps = { params: Promise<{ userId: string }> };

export default function PublicProfile({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("submissions");

  useEffect(() => {
    if (!userId || userId === "undefined") return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/user/profile/${userId}`);
        if (!response.ok) throw new Error("User profile not found");
        setData(await response.json());
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

  const { user, stats, heatmapData, recentSubmissions, challenges, resources } =
    data;
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Column */}
        <div className="lg:col-span-3 space-y-6">
          <UserProfileSidebar user={user} />
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
                      <ActivityRow
                        key={s.id}
                        title={s.title}
                        subtitle={new Date(s.createdAt).toLocaleDateString()}
                      />
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
                      <ActivityRow
                        key={c.id}
                        title={c.title}
                        subtitle={`${c.difficulty} Difficulty`}
                      />
                    ))
                  ) : (
                    <EmptyState msg="You haven't participated in any challenges yet." />
                  )}
                </div>
              )}

              {activeTab === "resources" && (
                <div className="divide-y divide-slate-100">
                  {resources?.length > 0 ? (
                    resources.map((r: any) => (
                      <ActivityRow
                        key={r.id}
                        title={r.title}
                        subtitle={r.type}
                      />
                    ))
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
    </div>
  );
}

// --- Sub-components adapted for Light Mode ---

function ActivityRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer">
      <div className="flex flex-col">
        <span className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">
          {title}
        </span>
        <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
          {subtitle}
        </span>
      </div>
      <ChevronRight
        size={16}
        className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all"
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
