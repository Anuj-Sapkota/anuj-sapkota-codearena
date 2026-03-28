import { Trophy, Flame } from "lucide-react";

export function SidebarStat({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between text-sm bg-[#252525] p-3 rounded-lg">
      <div className="flex items-center gap-2">{icon}<span>{label}</span></div>
      <span className="text-white font-mono">{value}</span>
    </div>
  );
}

export default function UserProfileSidebar({ user }: any) {
  return (
    <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-xl">
      <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-2xl mb-4 flex items-center justify-center text-4xl font-black text-white shadow-lg">
        {user.name ? user.name[0].toUpperCase() : "?"}
      </div>
      <h1 className="text-2xl font-bold text-white tracking-tight">{user.name || "Coder"}</h1>
      <p className="text-gray-500 text-sm font-medium">@{user.username || "username"}</p>

      <div className="mt-6 space-y-3">
        <SidebarStat icon={<Trophy size={16} className="text-yellow-500" />} label="Rank" value="#1,234" />
        <SidebarStat icon={<Flame size={16} className="text-orange-500" />} label="Streak" value={`${user.streak || 0} days`} />
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase text-gray-600 font-bold mb-2">Bio</p>
        <p className="text-sm text-gray-400 leading-relaxed italic">
          "{user.bio || "This coder prefers to let their work speak for them."}"
        </p>
      </div>
    </div>
  );
}