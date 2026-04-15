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

  const stats = [
    { label: "XP Points",   value: xp.toLocaleString(),             icon: <FiZap className="text-primary-1" /> },
    { label: "Level",       value: `Lv. ${level}`,                  icon: <FaStar className="text-amber-500" /> },
    { label: "Weekly Rank", value: userRank ? `#${userRank}` : "—", icon: <FaTrophy className="text-amber-500" /> },
    { label: "Streak",      value: `${streak} 🔥`,                  icon: <FaFire className="text-rose-500" /> },
  ];

  return (
    <header className="mb-12">
      <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
        WELCOME_BACK, <span className="text-primary-1 italic">{firstName}</span>
      </h1>
      <p className="text-slate-500 font-medium mb-6">
        {userRank
          ? <>Your current rank is <span className="text-slate-900 font-bold">#{userRank}</span>. You are <span className="text-primary-1 font-bold">{toNext} XP</span> away from level {level + 1}.</>
          : <>You are <span className="text-primary-1 font-bold">{toNext} XP</span> away from level {level + 1}. Keep solving!</>}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-3">
            <div className="text-lg">{s.icon}</div>
            <div>
              <p className="text-lg font-black text-slate-900">{s.value}</p>
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progress to Level {level + 1}</span>
          <span className="text-[10px] font-black text-primary-1">{pct}% · {toNext} XP to go</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary-1 transition-all duration-700 rounded-full" style={{ width: `${pct}%` }} />
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
        Solve algorithmic problems, take on live challenges, learn from creator courses, and climb the leaderboard.
      </p>
      <div className="flex items-center gap-4">
        <Link href={ROUTES.AUTH.REGISTER} className="bg-primary-1 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all shadow-sm">
          Get Started Free
        </Link>
        <Link href={ROUTES.MAIN.PROBLEMS} className="border border-slate-200 text-slate-700 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-slate-400 transition-all bg-white">
          Browse Problems
        </Link>
      </div>
    </header>
  );
}
