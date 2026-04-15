"use client";

import { useRef } from "react";
import { FiChevronRight } from "react-icons/fi";

interface CategoryBarProps {
  categories: { categoryId: number; name: string }[];
  activeCategory: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryBar({ categories, activeCategory, onSelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center gap-2">
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        <button
          onClick={() => onSelect(null)}
          className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border-2 shrink-0 ${
            !activeCategory
              ? "bg-slate-900 border-slate-900 text-white"
              : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 bg-white"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            onClick={() => onSelect(cat.categoryId)}
            className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all border-2 shrink-0 ${
              activeCategory === cat.categoryId
                ? "bg-primary-1 border-primary-1 text-white"
                : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 bg-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
        className="shrink-0 w-8 h-8 bg-slate-100 border-2 border-slate-200 rounded-sm flex items-center justify-center hover:bg-slate-200 transition-colors"
      >
        <FiChevronRight size={14} className="text-slate-500" />
      </button>
    </div>
  );
}
