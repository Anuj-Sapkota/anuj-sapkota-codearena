import React from "react";
import { Code2 } from "lucide-react";

interface Language {
  name: string;
  count: number;
}

interface LanguageStatsProps {
  languages: Language[];
}

export default function LanguageStats({ languages }: LanguageStatsProps) {
  if (!languages || languages.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">
          Languages
        </h3>
        <p className="text-slate-400 text-sm italic">
          No language data available yet.
        </p>
      </div>
    );
  }

  // Find the highest count to calculate relative widths
  const maxCount = Math.max(...languages.map((l) => l.count));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <Code2 size={16} className="text-blue-600" />
        <h3 className="text-slate-800 text-[11px] font-bold uppercase tracking-widest">
          Languages Used
        </h3>
      </div>

      <div className="space-y-5">
        {languages.map((lang) => {
          // Calculate percentage relative to the most used language
          const barWidth = (lang.count / maxCount) * 100;

          return (
            <div key={lang.name} className="group">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {lang.name}
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
                  {lang.count} {lang.count === 1 ? "Problem" : "Problems"}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-600 group-hover:to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
