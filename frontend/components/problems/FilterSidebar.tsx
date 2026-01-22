"use client";
import { FaCheck } from "react-icons/fa";

interface FilterSidebarProps {
  selectedStatus: string[];
  selectedDifficulty: string[];
  onStatusChange: (status: string) => void;
  onDifficultyChange: (diff: string) => void;
}

export default function FilterSidebar({ selectedStatus, selectedDifficulty, onStatusChange, onDifficultyChange }: FilterSidebarProps) {
  const statusOptions = ["Solved", "Unsolved", "Attempted"];
  const difficultyOptions = ["EASY", "MEDIUM", "HARD"];

  const Checkbox = ({ label, isChecked, onChange }: { label: string; isChecked: boolean; onChange: () => void }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-xs font-black text-slate-600 uppercase group-hover:text-slate-900 transition-colors">{label}</span>
      <div className={`h-7 w-7 border-2 rounded flex items-center justify-center transition-all ${isChecked ? "border-primary-1 bg-primary-1 text-white" : "border-slate-300 bg-white"}`}>
        {isChecked && <FaCheck size={12} />}
      </div>
      <input type="checkbox" className="hidden" checked={isChecked} onChange={onChange} />
    </label>
  );

  return (
    <aside className="space-y-12 pl-6 border-l border-slate-100">
      <div>
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 border-b-4 border-slate-900 pb-2 inline-block">Filters_</h4>
        
        <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Submission_State</p>
        <div className="space-y-4 mb-10">
          {statusOptions.map(s => (
            <Checkbox key={s} label={s} isChecked={selectedStatus.includes(s)} onChange={() => onStatusChange(s)} />
          ))}
        </div>

        <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Complexity_Scale</p>
        <div className="space-y-4">
          {difficultyOptions.map(d => (
            <Checkbox key={d} label={d} isChecked={selectedDifficulty.includes(d)} onChange={() => onDifficultyChange(d)} />
          ))}
        </div>
      </div>
    </aside>
  );
}