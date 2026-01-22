"use client";
import { useRef } from "react";
import { FaChevronRight } from "react-icons/fa";

interface CategoryBarProps {
  categories: { categoryId: number; name: string }[];
  activeCategory: number | null;
  onSelect: (id: number | null) => void;
}

export default function CategoryBar({ categories, activeCategory, onSelect }: CategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex items-center gap-4">
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2">
        <button
          onClick={() => onSelect(null)}
          className={`px-8 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all border-2 flex-shrink-0 ${!activeCategory ? "bg-primary-1 border-primary-1 text-white shadow-xl" : "border-slate-300 text-slate-500 hover:border-slate-400"}`}
        >
          All_Archive
        </button>
        {categories.map((cat) => (
          <button
            key={cat.categoryId}
            onClick={() => onSelect(cat.categoryId)}
            className={`px-8 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all border-2 flex-shrink-0 ${activeCategory === cat.categoryId ? "bg-primary-1 border-primary-1 text-white shadow-xl" : "border-slate-300 text-slate-500 hover:border-slate-400"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
        className="h-12 w-12 shrink-0 bg-slate-100 border-2 border-slate-200 rounded-md flex items-center justify-center hover:bg-slate-200 transition-colors"
      >
        <FaChevronRight className="text-slate-600" size={16} />
      </button>
    </div>
  );
}