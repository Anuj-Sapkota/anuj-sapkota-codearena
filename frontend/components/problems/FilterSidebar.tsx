"use client";
import { FaCheck } from "react-icons/fa";

// Define the interface to eliminate 'any'
interface FilterSidebarProps {
  selectedStatus: string[];
  selectedDifficulty: string[];
  onStatusChange: (status: string) => void; // 'status' is a string
  onDifficultyChange: (diff: string) => void; // 'diff' is a string
}

export default function FilterSidebar({ 
  selectedStatus, 
  selectedDifficulty, 
  onStatusChange, 
  onDifficultyChange 
}: FilterSidebarProps) { // Apply the interface here
  const statusOptions = ["Solved", "Unsolved", "Attempted"];
  const difficultyOptions = ["EASY", "MEDIUM", "HARD"];

  const Checkbox = ({ label, isChecked, onChange }: { label: string; isChecked: boolean; onChange: () => void }) => (
    <label className="flex items-center justify-between cursor-pointer group py-1">
      <span className="text-xs font-black text-slate-600 uppercase group-hover:text-slate-900 transition-colors">
        {label}
      </span>
      <div 
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className={`h-6 w-6 border-2 rounded flex items-center justify-center transition-all ${
          isChecked 
            ? "border-primary-1 bg-primary-1 text-white" 
            : "border-slate-300 bg-white hover:border-slate-400"
        }`}
      >
        {isChecked && <FaCheck className="text-white fill-current" size={10} />}
      </div>
      <input type="checkbox" className="hidden" checked={isChecked} readOnly />
    </label>
  );

  return (
    <aside className="w-full lg:w-auto space-y-8 lg:space-y-12 lg:pl-8 border-t lg:border-t-0 lg:border-l border-slate-100 pt-8 lg:pt-0">
      <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-6 border-b-4 border-slate-900 pb-2 inline-block">
        Filters_
      </h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Submission_State</p>
          <div className="space-y-3">
            {statusOptions.map(s => (
              <Checkbox key={s} label={s} isChecked={selectedStatus.includes(s)} onChange={() => onStatusChange(s)} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Complexity_Scale</p>
          <div className="space-y-3">
            {difficultyOptions.map(d => (
              <Checkbox key={d} label={d} isChecked={selectedDifficulty.includes(d)} onChange={() => onDifficultyChange(d)} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}