"use client";

import { FiCheck } from "react-icons/fi";

interface FilterSidebarProps {
  selectedStatus: string[];
  selectedDifficulty: string[];
  onStatusChange: (status: string) => void;
  onDifficultyChange: (diff: string) => void;
}

const DIFFICULTY_STYLE: Record<string, string> = {
  EASY:   "text-emerald-600",
  MEDIUM: "text-amber-600",
  HARD:   "text-rose-600",
};

function FilterChip({ label, isChecked, onChange, colorClass }: {
  label: string;
  isChecked: boolean;
  onChange: () => void;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onChange}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm border-2 transition-all text-left ${
        isChecked
          ? "border-primary-1 bg-primary-1/5"
          : "border-slate-100 hover:border-slate-300 bg-white"
      }`}
    >
      <span className={`text-[11px] font-black uppercase tracking-wide ${isChecked ? "text-primary-1" : colorClass ?? "text-slate-600"}`}>
        {label}
      </span>
      <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all shrink-0 ${
        isChecked ? "border-primary-1 bg-primary-1" : "border-slate-300"
      }`}>
        {isChecked && <FiCheck size={9} className="text-white" strokeWidth={3} />}
      </div>
    </button>
  );
}

export default function FilterSidebar({
  selectedStatus,
  selectedDifficulty,
  onStatusChange,
  onDifficultyChange,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Status</p>
        <div className="space-y-1.5">
          {["Solved", "Unsolved", "Attempted"].map((s) => (
            <FilterChip
              key={s}
              label={s}
              isChecked={selectedStatus.includes(s)}
              onChange={() => onStatusChange(s)}
            />
          ))}
        </div>
      </div>

      <div className="border-t-2 border-slate-100 pt-6">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Difficulty</p>
        <div className="space-y-1.5">
          {["EASY", "MEDIUM", "HARD"].map((d) => (
            <FilterChip
              key={d}
              label={d}
              isChecked={selectedDifficulty.includes(d)}
              onChange={() => onDifficultyChange(d)}
              colorClass={DIFFICULTY_STYLE[d]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
