"use client";

import Modal from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/Form";
import { FaFilter, FaUndo } from "react-icons/fa";

// Defining the specific types for the union to avoid overlap issues
type SortOption = "name_asc" | "name_desc" | "problems_high" | "problems_low";
type ActivityFilter = "all" | "yes" | "no";

interface FilterState {
  sortBy: SortOption;
  hasProblems: ActivityFilter;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export default function CategoryFilterModal({ isOpen, onClose, filters, setFilters }: Props) {
  const resetFilters = () => {
    setFilters({ sortBy: "name_asc", hasProblems: "all" });
  };

  // Using 'as const' here makes TypeScript treat the IDs as literals, not generic strings
  const activityOptions = [
    { id: "all", label: "Show All Categories" },
    { id: "yes", label: "Only Active (Has Problems)" },
    { id: "no", label: "Only Empty Categories" },
  ] as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="border-b-2 border-gray-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-darkest uppercase tracking-tight">Filter Records</h3>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Refine taxonomy results</p>
          </div>
          <FaFilter className="text-primary-1" size={20} />
        </div>

        <div className="space-y-6">
          {/* Sorting Option */}
          <div className="space-y-2">
            <FormLabel>Sort</FormLabel>
            <select 
              value={filters.sortBy}
              // Cast the value directly to our SortOption type
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SortOption })}
              className="w-full bg-white border-2 border-gray-200 rounded-md p-3 text-xs font-black uppercase tracking-widest cursor-pointer outline-none focus:border-primary-1 transition-colors"
            >
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="problems_high">Most Problems First</option>
              <option value="problems_low">Least Problems First</option>
            </select>
          </div>

          {/* Problem Count Filter */}
          <div className="space-y-2">
            <FormLabel>Activity Level</FormLabel>
            <div className="grid grid-cols-1 gap-2">
              {activityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFilters({ ...filters, hasProblems: opt.id })}
                  className={`text-left px-4 py-3 border-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    filters.hasProblems === opt.id 
                    ? "border-primary-1 bg-primary-1/5 text-primary-1" 
                    : "border-gray-200 text-muted hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          <button 
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-2 text-muted font-black text-[10px] uppercase tracking-widest hover:text-darkest cursor-pointer transition-colors"
          >
            <FaUndo size={10} /> Reset Filters
          </button>
          <button 
            type="button"
            onClick={onClose}
            className="bg-darkest text-white px-8 py-3 rounded-md font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 cursor-pointer active:scale-95 transition-all shadow-lg shadow-darkest/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </Modal>
  );
}