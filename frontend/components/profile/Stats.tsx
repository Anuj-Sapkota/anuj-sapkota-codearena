export function StatCard({ label, value, color, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm hover:shadow-md group">
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`${color} p-1.5 bg-slate-50 rounded-lg group-hover:bg-white transition-colors`}
        >
          {icon}
        </span>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          {label}
        </p>
      </div>
      <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
    </div>
  );
}

export function DifficultyCircle({ label, count, total, color }: any) {
  const safeCount = count || 0;
  const safeTotal = total || 0;
  const percentage = safeTotal > 0 ? Math.min((safeCount / safeTotal) * 100, 100) : 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (circumference * percentage) / 100;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background Track - Light Slate */}
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            strokeWidth="7"
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress Stroke */}
          <circle
            cx="48"
            cy="48"
            r="42"
            stroke="currentColor"
            strokeWidth="7"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${color} transition-all duration-1000 ease-out`}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className="text-xl font-black text-slate-800 leading-none">
            {count || 0}
          </span>
          <div className="h-[1px] w-4 bg-slate-200 my-1" />
          <span className="text-[9px] text-slate-400 font-bold uppercase">
            {total}
          </span>
        </div>
      </div>
      <p className="text-[11px] mt-4 font-bold text-slate-500 group-hover:text-slate-900 uppercase tracking-widest transition-colors">
        {label}
      </p>
    </div>
  );
}
