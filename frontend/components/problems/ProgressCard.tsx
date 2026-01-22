"use client";

interface ProgressCardProps {
  solvedCount: number;
  totalCount: number;
}

export default function ProgressCard({ solvedCount, totalCount }: ProgressCardProps) {
  // Calculate percentage safely
  const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;
  
  // Circumference of the circle (2 * PI * r) where r=18
  const strokeDasharray = 113; 
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100;

  return (
    <div className="flex items-center gap-5 bg-slate-50 border-2 border-slate-100 px-6 py-3 rounded-md min-w-[280px] h-[68px] shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-10 w-10">
        <svg className="h-10 w-10 -rotate-90">
          {/* Background Circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          {/* Progress Circle */}
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="transparent"
            stroke="#10b981" // Emerald-500
            strokeWidth="4"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Success_Rate
        </p>
        <p className="text-lg font-black text-slate-700 italic">
          <span className="text-emerald-500">{solvedCount}</span>
          <span className="mx-1 text-slate-300">/</span>
          <span className="text-slate-500">{totalCount}</span>
        </p>
      </div>
    </div>
  );
}