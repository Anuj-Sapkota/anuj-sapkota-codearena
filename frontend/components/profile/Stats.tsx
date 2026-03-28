export function StatCard({ label, value, color, icon }: any) {
  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
    </div>
  );
}

export function DifficultyCircle({ label, count, total, color }: any) {
  const percentage = Math.min(((count || 0) / total) * 100, 100);
  return (
    <div className="flex flex-col items-center group">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#252525]" />
          <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={264} strokeDashoffset={264 - (264 * percentage) / 100} className={`${color} transition-all duration-1000 ease-out`} strokeLinecap="round" />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-black text-white">{count || 0}</span>
          <span className="text-[10px] text-gray-600 font-bold uppercase">/ {total}</span>
        </div>
      </div>
      <p className="text-xs mt-3 font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">{label}</p>
    </div>
  );
}