"use client";

interface ProgressCardProps {
  solvedCount: number;
  totalCount: number;
}

export default function ProgressCard({ solvedCount, totalCount }: ProgressCardProps) {
  const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
  const r = 16;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * pct) / 100;

  return (
    <div className="flex items-center gap-4 bg-white border-2 border-slate-100 rounded-sm px-5 py-3 shadow-sm">
      {/* Ring */}
      <div className="relative w-10 h-10 shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
          <circle
            cx="20" cy="20" r={r} fill="none"
            stroke="#138b51"
            strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-slate-700">
          {pct}%
        </span>
      </div>

      {/* Text */}
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Solved</p>
        <p className="text-base font-black text-slate-900 leading-none">
          <span className="text-primary-1">{solvedCount}</span>
          <span className="text-slate-300 mx-1">/</span>
          <span className="text-slate-500">{totalCount}</span>
        </p>
      </div>
    </div>
  );
}
