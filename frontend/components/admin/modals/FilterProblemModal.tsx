"use client";

import Modal from "@/components/ui/Modal";
import { FormLabel } from "@/components/ui/Form";
import { FaFilter, FaUndo, FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useState, useEffect } from "react";

export type ProblemSortOption = "newest" | "oldest" | "title_asc" | "title_desc";
export type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD";

export interface ProblemFilterState {
  sortBy: ProblemSortOption;
  difficulty: DifficultyFilter;
  categoryIds: number[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  filters: ProblemFilterState;
  setFilters: (filters: ProblemFilterState) => void;
}

export default function ProblemFilterModal({ isOpen, onClose, filters, setFilters }: Props) {
  const { items: categories } = useSelector((state: RootState) => state.category);
  
  // Local state to keep changes until "Apply" is clicked
  const [localFilters, setLocalFilters] = useState<ProblemFilterState>(filters);

  // Sync local state when modal opens
  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const resetFilters = () => {
    setLocalFilters({ sortBy: "newest", difficulty: "ALL", categoryIds: [] });
  };

  const toggleCategory = (id: number) => {
    const isSelected = localFilters.categoryIds.includes(id);
    setLocalFilters({
      ...localFilters,
      categoryIds: isSelected
        ? localFilters.categoryIds.filter((cId) => cId !== id)
        : [...localFilters.categoryIds, id],
    });
  };

  const difficultyOptions: DifficultyFilter[] = ["ALL", "EASY", "MEDIUM", "HARD"];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
        <div className="border-b-2 border-gray-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-darkest uppercase tracking-tight">Challenge_Filter</h3>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Refine challenge registry</p>
          </div>
          <FaFilter className="text-primary-1" size={20} />
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <FormLabel>Chronological_Sort</FormLabel>
            <select 
              value={localFilters.sortBy}
              onChange={(e) => setLocalFilters({ ...localFilters, sortBy: e.target.value as ProblemSortOption })}
              className="w-full bg-white border-2 border-gray-200 rounded-md p-3 text-xs font-black uppercase tracking-widest cursor-pointer outline-none focus:border-primary-1 transition-colors"
            >
              <option value="newest">Newest Records First</option>
              <option value="oldest">Oldest Records First</option>
              <option value="title_asc">Title (A-Z)</option>
              <option value="title_desc">Title (Z-A)</option>
            </select>
          </div>

          <div className="space-y-2">
            <FormLabel>Complexity_Level</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, difficulty: level })}
                  className={`px-4 py-3 border-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    localFilters.difficulty === level 
                    ? "border-primary-1 bg-primary-1/5 text-primary-1" 
                    : "border-gray-200 text-muted hover:border-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel>Taxonomy_Tags</FormLabel>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = localFilters.categoryIds.includes(cat.categoryId);
                return (
                  <button
                    key={cat.categoryId}
                    type="button"
                    onClick={() => toggleCategory(cat.categoryId)}
                    className={`px-3 py-2 border-2 rounded-md text-[9px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected 
                      ? "border-primary-1 bg-primary-1/5 text-primary-1" 
                      : "border-gray-200 text-muted hover:border-gray-300"
                    }`}
                  >
                    {cat.name}
                    {isSelected && <FaCheckCircle size={10} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
          <button 
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-2 text-muted font-black text-[10px] uppercase tracking-widest hover:text-darkest cursor-pointer transition-colors"
          >
            <FaUndo size={10} /> Reset_Buffer
          </button>
          <button 
            type="button"
            onClick={handleApply}
            className="bg-darkest text-white px-8 py-3 rounded-md font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 cursor-pointer active:scale-95 transition-all shadow-lg shadow-darkest/10"
          >
            Apply_Parameters
          </button>
        </div>
      </div>
    </Modal>
  );
}