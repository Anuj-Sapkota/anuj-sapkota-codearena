"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown, FiArrowDown } from "react-icons/fi";

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  options: readonly { label: string; value: string }[] | { label: string; value: string }[];
}

export default function SortDropdown({ sortBy, onSortChange, options }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLabel = options.find((o) => o.value === sortBy)?.label || "Sort by";

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-3 border-2 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all bg-white ${
          open ? "border-primary-1 text-primary-1" : "border-slate-200 text-slate-500 hover:border-slate-400"
        }`}
      >
        <FiArrowDown size={13} />
        <span>{currentLabel}</span>
        <FiChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+6px)] right-0 min-w-[180px] bg-white border-2 border-slate-100 rounded-sm shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSortChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-colors border-l-2 ${
                sortBy === opt.value
                  ? "text-primary-1 bg-primary-1/5 border-primary-1"
                  : "text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
