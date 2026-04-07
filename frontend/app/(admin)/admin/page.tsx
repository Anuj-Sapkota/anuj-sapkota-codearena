"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import api from "@/lib/api";
import { API } from "@/constants/api.constants";
import { ROUTES } from "@/constants/routes";
import {
  FiUsers, FiCode, FiCheckCircle, FiAlertCircle,
  FiTrendingUp, FiLoader, FiZap, FiBook, FiShield,
  FiMail, FiBarChart2, FiAward,
} from "react-icons/fi";
import { LuSwords } from "react-icons/lu";

// ─── Data hook ────────────────────────────────────────────────────────────────
const useAdminStats = () =>
  useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await api.get(API.ADMIN.STATS);
      return data;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

// ─── Bar chart (pure SVG, no lib needed) ─────────────────────────────────────
function SubmissionChart({ data }: { data: { label: string; total: number; accepted: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const H = 80;

  return (
    <div className="flex items-end gap-1.5 h-[80px] w-full">
      {data.map((d, i) => {
        const totalH = Math.round((d.total / maxVal) * H);
        const acceptedH = Math.round((d.accepted / maxVal) * H);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {d.total} total · {d.accepted} accepted
            </div>
            <div className="w-full flex flex-col justify-end" style={{ height: H }}>
              {/* Total bar (background) */}
              <div
                className="w-full bg-slate-100 rounded-sm relative overflow-hidden"
                style={{ height: Math.max(totalH, 2) }}
              >
                {/* Accepted bar (overlay) */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary-1 rounded-sm transition-all duration-700"
                  style={{ height: Math.max(acceptedH, 0) }}
                />
              </div>
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Difficulty donut (SVG) ───────────────────────────────────────────────────
function DifficultyDonut({ data }: { data: { difficulty: string; count: number }[] }) {
  const colors: Record<string, string> = {
    EASY: "#10b981",
    MEDIUM: "#f59e0b",
    HARD: "#ef4444",
  };
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const R = 36, cx = 44, cy = 44;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const segments = data.map((d) => {
    const pct = d.count / total;
    const dash = pct * circumference;
    const seg = { ...d, dash, offset, pct };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={10} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={colors[s.difficulty] || "#94a3b8"}
            strokeWidth={10}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
          />
        ))}
      </svg>
      <div className="space-y-1.5">
        {data.map((d) => (
          <div key={d.difficulty} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[d.difficulty] || "#94a3b8" }} />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider w-14">{d.difficulty}</span>
            <span className="text-[11px] font-black text-slate-900">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label, value, icon, href, alert,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  href?: string;
  alert?: boolean;
}) {
  const inner = (
    <div className={`bg-white border-2 rounded-sm p-5 flex items-center gap-4 transition-all ${
      alert ? "border-amber-200 bg-amber-50/30" : "border-slate-100 hover:border-slate-300"
    } ${href ? "cursor-pointer" : ""}`}>
      <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${
        alert ? "bg-amber-100" : "bg-slate-50 border border-slate-100"
      }`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">{label}</p>
        <p className={`text-xl font-black mt-0.5 ${alert ? "text-amber-600" : "text-slate-900"}`}>{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();

  const counts = data?.counts ?? {};
  const chart = data?.submissionChart ?? [];
  const difficulty = data?.difficultyBreakdown ?? [];
  const recentUsers = data?.recentUsers ?? [];

  const quickLinks = [
    { label: "Problems",     href: ROUTES.ADMIN.PROBLEMS,     icon: <FiCode size={14} className="text-blue-500" /> },
    { label: "Challenges",   href: ROUTES.ADMIN.CHALLENGES,   icon: <LuSwords size={14} className="text-violet-500" /> },
    { label: "Categories",   href: ROUTES.ADMIN.CATEGORIES,   icon: <FiBarChart2 size={14} className="text-slate-500" /> },
    { label: "Badges",       href: ROUTES.ADMIN.BADGES,       icon: <FiAward size={14} className="text-amber-500" /> },
    { label: "Moderation",   href: ROUTES.ADMIN.MODERATION,   icon: <FiShield size={14} className="text-rose-500" /> },
    { label: "Applications", href: ROUTES.ADMIN.APPLICATION,  icon: <FiMail size={14} className="text-emerald-500" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-slate-300" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900">
          Dashboard<span className="text-primary-1">.</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
          Platform overview
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Users"       value={counts.users ?? 0}            icon={<FiUsers size={15} className="text-blue-500" />} />
        <StatCard label="Problems"          value={counts.problems ?? 0}          icon={<FiCode size={15} className="text-violet-500" />} href={ROUTES.ADMIN.PROBLEMS} />
        <StatCard label="Total Submissions" value={counts.submissions ?? 0}       icon={<FiTrendingUp size={15} className="text-slate-500" />} />
        <StatCard label="Acceptance Rate"   value={`${counts.acceptanceRate ?? 0}%`} icon={<FiCheckCircle size={15} className="text-emerald-500" />} />
        <StatCard label="Today Submissions" value={counts.todaySubmissions ?? 0}  icon={<FiZap size={15} className="text-amber-500" />} />
        <StatCard label="Resources"         value={counts.resources ?? 0}         icon={<FiBook size={15} className="text-blue-400" />} />
        <StatCard label="Pending Applications" value={counts.pendingApplications ?? 0} icon={<FiMail size={15} className="text-amber-500" />} href={ROUTES.ADMIN.APPLICATION} alert={(counts.pendingApplications ?? 0) > 0} />
        <StatCard label="Flagged Discussions"  value={counts.flaggedDiscussions ?? 0}  icon={<FiAlertCircle size={15} className="text-rose-500" />} href={ROUTES.ADMIN.MODERATION} alert={(counts.flaggedDiscussions ?? 0) > 0} />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Submission trend */}
        <div className="md:col-span-2 bg-white border-2 border-slate-100 rounded-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Submission Trend</p>
              <p className="text-sm font-black text-slate-900 mt-0.5">Last 7 Days</p>
            </div>
            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Total</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary-1" /> Accepted</span>
            </div>
          </div>
          {chart.length > 0
            ? <SubmissionChart data={chart} />
            : <div className="h-20 flex items-center justify-center text-[10px] text-slate-300 font-black uppercase tracking-widest">No data yet</div>}
        </div>

        {/* Difficulty breakdown */}
        <div className="bg-white border-2 border-slate-100 rounded-sm p-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Problem Difficulty</p>
          <p className="text-sm font-black text-slate-900 mb-5">Breakdown</p>
          {difficulty.length > 0
            ? <DifficultyDonut data={difficulty} />
            : <div className="h-20 flex items-center justify-center text-[10px] text-slate-300 font-black uppercase tracking-widest">No problems yet</div>}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white border-2 border-slate-100 rounded-sm p-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Signups</p>
          <div className="space-y-3">
            {recentUsers.length === 0 && (
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">No users yet</p>
            )}
            {recentUsers.map((u: any) => (
              <div key={u.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                  {u.profile_pic_url
                    ? <img src={u.profile_pic_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[10px] font-black text-slate-400">{u.username?.[0]?.toUpperCase()}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-slate-900 truncate">{u.full_name}</p>
                  <p className="text-[9px] text-slate-400 font-bold">@{u.username}</p>
                </div>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm ${
                  u.role === "ADMIN" ? "bg-rose-50 text-rose-600" :
                  u.role === "CREATOR" ? "bg-violet-50 text-violet-600" :
                  "bg-slate-50 text-slate-500"
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white border-2 border-slate-100 rounded-sm p-6">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Quick Access</p>
          <div className="grid grid-cols-2 gap-2">
            {quickLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2.5 p-3 border-2 border-slate-100 rounded-sm hover:border-slate-900 hover:bg-slate-50 transition-all group"
              >
                {l.icon}
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider group-hover:text-slate-900 transition-colors">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
