"use client";

import React, { useEffect, useState, use } from "react";
import { Tooltip } from "react-tooltip";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Trophy, Flame, CheckCircle, Code, Loader2 } from "lucide-react";

// Next.js 15: params is a Promise. Case must match folder [userId]
type PageProps = {
  params: Promise<{ userId: string }>;
};

export default function PublicProfile({ params }: PageProps) {
  // 1. Unwrap the promise to get the userId from the URL segment [userId]
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Debugging: Verify if 'userId' is now the number from your URL (e.g., "3")
    console.log("Current URL userId:", userId);

    if (!userId || userId === "undefined") {
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Ensure the environment variable is loaded
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

        const response = await fetch(`${apiUrl}/user/profile/${userId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "User profile not found");
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Loading CodeArena Profile...
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-red-500 flex-col gap-4">
        <p className="text-xl font-bold font-mono">
          Error: {error || "Failed to load profile"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  // Success State: Destructure data
  const stats = data.stats || { easy: 0, medium: 0, hard: 0 };
  const user = data.user || {};
  const totalSolved =
    (stats.easy || 0) + (stats.medium || 0) + (stats.hard || 0);

  // Inside your PublicProfile component, before the return (...)
  console.log("🔥 FULL DATA FROM API:", data);
  console.log("📊 HEATMAP DATA:", data?.heatmapData);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- LEFT SIDEBAR: User Info --- */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-xl">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-2xl mb-4 flex items-center justify-center text-4xl font-black text-white shadow-lg">
              {user.name ? user.name[0].toUpperCase() : "?"}
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {user.name || "Coder"}
            </h1>
            <p className="text-gray-500 text-sm font-medium">
              @{user.username || "username"}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-sm bg-[#252525] p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  <span>Rank</span>
                </div>
                <span className="text-white font-mono">#1,234</span>
              </div>
              <div className="flex items-center justify-between text-sm bg-[#252525] p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-500" />
                  <span>Streak</span>
                </div>
                <span className="text-white font-mono">
                  {user.streak || 0} days
                </span>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs uppercase text-gray-600 font-bold mb-2">
                Bio
              </p>
              <p className="text-sm text-gray-400 leading-relaxed italic">
                "
                {user.bio ||
                  "This coder prefers to let their work speak for them."}
                "
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT: Dashboard --- */}
        <div className="lg:col-span-9 space-y-6">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Solved"
              value={totalSolved}
              color="text-green-500"
              icon={<CheckCircle size={16} />}
            />
            <StatCard
              label="Reputation / XP"
              value={user.xp || 0}
              color="text-blue-500"
              icon={<Trophy size={16} />}
            />
            <StatCard
              label="Current Level"
              value={user.level || 1}
              color="text-purple-500"
              icon={<Code size={16} />}
            />
          </div>

          {/* PROGRESS CIRCLES */}
          <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 shadow-xl">
            <h3 className="text-white mb-8 font-bold flex items-center gap-2 text-lg">
              Statistics
            </h3>
            <div className="flex flex-wrap justify-around gap-8">
              <DifficultyCircle
                label="Easy"
                count={stats.easy}
                total={100}
                color="stroke-green-500"
              />
              <DifficultyCircle
                label="Medium"
                count={stats.medium}
                total={100}
                color="stroke-yellow-500"
              />
              <DifficultyCircle
                label="Hard"
                count={stats.hard}
                total={100}
                color="stroke-red-500"
              />
            </div>
          </div>

          {/* --- UPDATED SUBMISSION HEATMAP --- */}
          {/* --- SUBMISSION HEATMAP --- */}
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-lg">Activity History</h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase font-bold">
                <span>Less</span>
                <div className="w-3 h-3 bg-[#161b22] rounded-sm"></div>
                <div className="w-3 h-3 bg-[#0e4429] rounded-sm"></div>
                <div className="w-3 h-3 bg-[#006d32] rounded-sm"></div>
                <div className="w-3 h-3 bg-[#26a641] rounded-sm"></div>
                <div className="w-3 h-3 bg-[#39d353] rounded-sm"></div>
                <span>More</span>
              </div>
            </div>

            <div className="heatmap-container overflow-x-auto pb-2">
              <CalendarHeatmap
                startDate={
                  new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                }
                endDate={new Date()}
                values={data.heatmapData || []}
                classForValue={(value) => {
                  if (!value || value.count === 0) return "color-empty";
                  return `color-scale-${Math.min(value.count, 4)}`;
                }}
                tooltipDataAttrs={(value: any) => {
                  const dateStr = value?.date
                    ? new Date(value.date).toDateString()
                    : "";
                  return {
                    "data-tooltip-id": "heatmap-tooltip",
                    "data-tooltip-content": value?.count
                      ? `${value.count} submissions on ${dateStr}`
                      : `No submissions`,
                  } as any;
                }}
                showWeekdayLabels={true}
              />
            </div>
          </div>
          {/* RECENT SUBMISSIONS */}
          <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-xl overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-[#222]">
              <h3 className="text-white font-bold flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Recent Accepted Solutions
              </h3>
            </div>
            <div className="divide-y divide-gray-800">
              {data.recentSubmissions?.length > 0 ? (
                data.recentSubmissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="p-5 flex justify-between items-center hover:bg-[#252525] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-200 font-medium group-hover:text-white">
                        {sub.title}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs font-mono">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-gray-600 italic">
                  No recent activity recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Tooltip
        id="heatmap-tooltip"
        style={{
          backgroundColor: "#222",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "bold",
          border: "1px solid #444",
        }}
      />
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ label, value, color, icon }: any) {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
    </div>
  );
}

function DifficultyCircle({ label, count, total, color }: any) {
  const percentage = Math.min((count / total) * 100, 100);
  return (
    <div className="flex flex-col items-center group">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-[#252525]"
          />
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={264}
            strokeDashoffset={264 - (264 * percentage) / 100}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-black text-white">{count}</span>
          <span className="text-[10px] text-gray-600 font-bold uppercase">
            / {total}
          </span>
        </div>
      </div>
      <p className="text-xs mt-3 font-bold text-gray-400 group-hover:text-white transition-colors uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}
