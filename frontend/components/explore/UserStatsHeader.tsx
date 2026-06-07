"use client";

import { FaFire, FaStar, FaTrophy } from "react-icons/fa";
import { FiZap } from "react-icons/fi";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { UserProfile } from "@/types/auth.types";
import { xpToNextLevel, levelProgress } from "@/lib/gamification";

interface UserStatsHeaderProps {
  user: UserProfile;
  userRank: number | null;
}

export function UserStatsHeader({ user, userRank }: UserStatsHeaderProps) {
  const firstName = user.full_name?.split(" ")[0] || "";
  const xp = user.xp ?? 0;
  const level = user.level ?? 1;
  const streak = user.streak ?? 0;
  const toNext = xpToNextLevel(xp);
  const pct = levelProgress(xp);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const stats = [
    {
      label: "XP Points",
      value: xp.toLocaleString(),
      icon: <FiZap className="text-primary-1" />,
    },
    {
      label: "Level",
      value: `Lv. ${level}`,
      icon: <FaStar className="text-amber-500" />,
    },
    {
      label: "Weekly Rank",
      value: userRank ? `#${userRank}` : "—",
      icon: <FaTrophy className="text-amber-500" />,
    },
    {
      label: "Streak",
      value: `${streak} 🔥`,
      icon: <FaFire className="text-rose-500" />,
    },
  ];

  return (
    <header className="mb-12">
  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
    
    {/* Welcome Section */}
    <div className="flex-1">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
        WELCOME BACK, <span className="text-primary-1">{firstName}</span>
      </h1>

      <p className="text-slate-500 font-medium">
        {userRank ? (
          <>
            Your current rank is{" "}
            <span className="text-slate-900 font-bold">#{userRank}</span>. You
            are <span className="text-primary-1 font-bold">{toNext} XP</span>{" "}
            away from level {level + 1}.
          </>
        ) : (
          <>
            You are{" "}
            <span className="text-primary-1 font-bold">{toNext} XP</span> away
            from level {level + 1}. Keep solving!
          </>
        )}
      </p>
    </div>

    {/* Progress Card */}
    <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm min-w-[350px]">
      <div className="flex items-center gap-6">
        
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center">
          <svg width="120" height="120" className="-rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="8"
              fill="none"
            />

            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-primary-1 transition-all duration-700"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="absolute text-center">
            <p className="text-2xl font-black text-slate-900">{pct}%</p>
            <p className="text-[10px] uppercase font-bold text-slate-400">
              Complete
            </p>
          </div>
        </div>

        {/* Progress Info */}
        <div>
          <h3 className="text-lg font-black text-slate-900 mb-1">
            Level {level}
          </h3>

          <p className="text-slate-500 text-sm mb-3">
            <span className="font-bold text-primary-1">{toNext} XP</span>{" "}
            needed for Level {level + 1}
          </p>

          <div className="flex gap-6">
            <div>
              <p className="text-xs text-slate-400 uppercase">Current XP</p>
              <p className="font-black text-slate-900">
                {xp.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400 uppercase">Next Level</p>
              <p className="font-black text-slate-900">
                Lv. {level + 1}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</header>
  );
}

export function GuestHeader() {
  return (
    <header className="mb-12">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
        CODE. LEARN. <span className="text-primary-1 italic">COMPETE.</span>
      </h1>
      <p className="text-slate-500 font-medium mb-6 max-w-xl">
        Solve algorithmic problems, take on live challenges, learn from creator
        courses, and climb the leaderboard.
      </p>
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.AUTH.REGISTER}
          className="bg-primary-1 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all shadow-sm"
        >
          Get Started Free
        </Link>
        <Link
          href={ROUTES.MAIN.PROBLEMS}
          className="border border-slate-200 text-slate-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-slate-400 transition-all bg-white"
        >
          Browse Problems
        </Link>
      </div>
    </header>
  );
}
