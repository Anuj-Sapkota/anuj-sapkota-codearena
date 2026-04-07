import { Trophy, Flame, Calendar, Zap } from "lucide-react";
import Image from "next/image";

export function SidebarStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm group">
      <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-600">
        {icon}
        <span className="font-semibold">{label}</span>
      </div>
      <span className="text-slate-900 font-mono font-bold">{value}</span>
    </div>
  );
}

export default function UserProfileSidebar({ user }: { user: any }) {
  const joinDate = user.joined
    ? new Date(user.joined).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const xp = user.xp ?? 0;
  const level = user.level ?? 1;
  const streak = user.streak ?? 0;
  const xpInLevel = xp % 500;

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm relative overflow-hidden transition-all">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -z-10" />

      {/* Profile Image */}
      <div className="relative group w-24 h-24 mb-5">
        {user.profile_pic_url ? (
          <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-slate-100 group-hover:border-blue-400 transition-colors shadow-sm">
            <Image src={user.profile_pic_url} alt={user.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-md border-2 border-white">
            {user.name ? user.name[0].toUpperCase() : "?"}
          </div>
        )}
        <div className="absolute -bottom-2 -right-2 bg-white border border-slate-200 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
          LVL {level}
        </div>
      </div>

      {/* Identity */}
      <div className="space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
          {user.name || "CodeArena User"}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-blue-600 text-sm font-bold">@{user.username || "username"}</p>
          <span className="h-1 w-1 rounded-full bg-slate-300" />
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
            <Calendar size={12} />
            <span>Joined {joinDate}</span>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
            <Zap size={10} className="text-blue-500" /> XP Progress
          </span>
          <span className="text-[10px] font-black text-blue-600">{xp.toLocaleString()} XP</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-700"
            style={{ width: `${(xpInLevel / 500) * 100}%` }}
          />
        </div>
        <p className="text-[9px] text-slate-400 mt-1 font-bold">{500 - xpInLevel} XP to Level {level + 1}</p>
      </div>

      {/* Core Stats */}
      <div className="space-y-2.5">
        <SidebarStat
          icon={<Trophy size={14} className="text-amber-500" />}
          label="Weekly Rank"
          value={user.rank ? `#${user.rank}` : "—"}
        />
        <SidebarStat
          icon={<Flame size={14} className="text-orange-500" />}
          label="Streak"
          value={streak > 0 ? `${streak} 🔥` : "0 Days"}
        />
      </div>

      {/* Bio */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mb-2">About</p>
        <p className="text-sm text-slate-500 leading-relaxed italic font-medium">
          "{user.bio?.trim() || "This coder is currently focusing on building something great."}"
        </p>
      </div>
    </div>
  );
}
