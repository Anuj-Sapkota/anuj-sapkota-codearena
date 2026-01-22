"use client";

import { useState, useRef, useEffect } from "react";
import { FaSortAmountDown, FaChevronDown } from "react-icons/fa";

interface SortOption {
  label: string;
  value: string;
}

interface SortDropdownProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  options: SortOption[];
}

export default function SortDropdown({ sortBy, onSortChange, options }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = options.find((o) => o.value === sortBy)?.label || "Sort By";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-[64px] min-w-[200px] bg-slate-100 border-2 border-slate-200 rounded-md flex items-center justify-between px-6 hover:border-primary-1 transition-all group"
      >
        <div className="flex items-center gap-3">
          <FaSortAmountDown className="text-slate-500 group-hover:text-primary-1" size={18} />
          <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-darkest">
            {currentLabel}
          </span>
        </div>
        <FaChevronDown 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} 
          size={12} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border-2 border-slate-100 rounded-md shadow-2xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-6 py-4 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors border-l-4 ${
                sortBy === option.value 
                  ? "text-primary-1 bg-slate-50 border-primary-1" 
                  : "text-slate-500 border-transparent"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}