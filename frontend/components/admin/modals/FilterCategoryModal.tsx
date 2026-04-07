"use client";

import { FiX, FiRotateCcw, FiCheck } from "react-icons/fi";

type SortOption = "name_asc" | "name_desc" | "problems_high" | "problems_low";
type ActivityFilter = "all" | "yes" | "no";

interface FilterState { sortBy: SortOption; hasProblems: ActivityFilter; }

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name_asc",       label: "Name (A → Z)" },
  { value: "name_desc",      label: "Name (Z → A)" },
  { value: "problems_high",  label: "Most problems first" },
  { value: "problems_low",   label: "Least problems first" },
];

const ACTIVITY_OPTIONS: { id: ActivityFilter; label: string }[] = [
  { id: "all", label: "All categories" },
  { id: "yes", label: "Has problems" },
  { id: "no",  label: "Empty categories" },
];

export default function CategoryFilterModal({ isOpen, onClose, filters, setFilters }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Filters</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <FiX size={14} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Sort */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sort by</p>
            <div className="space-y-1">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setFilters({ ...filters, sortBy: o.value })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm border-2 text-[11px] font-bold transition-all ${
                    filters.sortBy === o.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-100 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {o.label}
                  {filters.sortBy === o.value && <FiCheck size={11} />}
                </button>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Activity</p>
            <div className="space-y-1">
              {ACTIVITY_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, hasProblems: o.id })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm border-2 text-[11px] font-bold transition-all ${
                    filters.hasProblems === o.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-100 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {o.label}
                  {filters.hasProblems === o.id && <FiCheck size={11} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFilters({ sortBy: "name_asc", hasProblems: "all" })}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            <FiRotateCcw size={11} /> Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all active:scale-95"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
