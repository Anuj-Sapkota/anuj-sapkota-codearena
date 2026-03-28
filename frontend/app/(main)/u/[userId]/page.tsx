"use client";

import React, { useEffect, useState, use } from "react";
import { Tooltip } from "react-tooltip";
import { Trophy, CheckCircle, Code, Loader2 } from "lucide-react";
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";

// Import your new components
import UserProfileSidebar from "@/components/profile/Sidebar";
import { StatCard, DifficultyCircle } from "@/components/profile/Stats";
import { ActivityHeatmap, RecentSubmissions } from "@/components/profile/Activity";
import LanguageStats from "@/components/profile/LanguageStats";

type PageProps = { params: Promise<{ userId: string }> };

export default function PublicProfile({ params }: PageProps) {
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );
  if (error || !data)
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  const { user, stats, heatmapData, recentSubmissions } = data;
  const totalSolved =
    (stats?.easy || 0) + (stats?.medium || 0) + (stats?.hard || 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <UserProfileSidebar user={user} />

          <LanguageStats languages={data.languageStats} />
        </div>

        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Solved"
              value={totalSolved}
              color="text-green-500"
              icon={<CheckCircle size={16} />}
            />
            <StatCard
              label="XP"
              value={user.xp || 0}
              color="text-blue-500"
              icon={<Trophy size={16} />}
            />
            <StatCard
              label="Level"
              value={user.level || 1}
              color="text-purple-500"
              icon={<Code size={16} />}
            />
          </div>

          <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-white mb-8 font-bold text-lg">Statistics</h3>
            <div className="flex flex-wrap justify-around gap-8">
              <DifficultyCircle
                label="Easy"
                count={stats?.easy}
                total={100}
                color="stroke-green-500"
              />
              <DifficultyCircle
                label="Medium"
                count={stats?.medium}
                total={100}
                color="stroke-yellow-500"
              />
              <DifficultyCircle
                label="Hard"
                count={stats?.hard}
                total={100}
                color="stroke-red-500"
              />
            </div>
          </div>

          <ActivityHeatmap heatmapData={heatmapData} />
          <RecentSubmissions submissions={recentSubmissions} />
        </div>
      </div>

      <Tooltip
        id="heatmap-tooltip"
        style={{ backgroundColor: "#222", border: "1px solid #444" }}
      />
    </div>
  );
}
