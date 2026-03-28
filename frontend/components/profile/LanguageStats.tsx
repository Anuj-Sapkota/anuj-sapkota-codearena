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
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
          Languages
        </h3>
        <p className="text-gray-600 text-sm italic">
          No language data available yet.
        </p>
      </div>
    );
  }

  // Find the highest count to calculate relative widths
  const maxCount = Math.max(...languages.map((l) => l.count));

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl transition-all hover:border-gray-700">
      <div className="flex items-center gap-2 mb-6">
        <Code2 size={16} className="text-blue-500" />
        <h3 className="text-white text-sm font-bold uppercase tracking-widest">
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
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                  {lang.name}
                </span>
                <span className="text-xs font-mono text-gray-500 bg-[#252525] px-2 py-0.5 rounded">
                  {lang.count} {lang.count === 1 ? "Problem" : "Problems"}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-1.5 w-full bg-[#252525] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-500 group-hover:to-cyan-400"
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
