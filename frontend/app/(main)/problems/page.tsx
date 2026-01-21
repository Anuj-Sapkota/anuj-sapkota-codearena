"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchProblemsThunk } from "@/lib/store/features/problems/problem.actions";
import { fetchCategoriesThunk } from "@/lib/store/features/category/category.actions";
import { FaChevronRight, FaCheck, FaSearch } from "react-icons/fa";
import { Problem, ProblemMeta } from "@/types/problem.types";
import SortDropdown from "@/components/problems/SortDropdown";

export default function UserProblemsPage() {
  const SORT_OPTIONS = [
    { label: "Newest Added", value: "" },
    { label: "Title (A - Z)", value: "title_asc" },
    { label: "Title (Z - A)", value: "title_desc" },
  ];

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { problems, meta } = useSelector((state: RootState) => state.problem);
  const { items: categories } = useSelector((state: RootState) => state.category);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]); // RESTORED
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const getStatusInfo = (status: Problem["status"]) => {
    switch (status) {
      case "SOLVED": return { label: "Completed", color: "text-emerald-500" };
      case "ATTEMPTED": return { label: "Attempted", color: "text-orange-500" };
      default: return { label: "Awaiting", color: "text-slate-400" };
    }
  };

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProblemsThunk({
        page: 1,
        search,
        difficulty: selectedDifficulty.length > 0 ? selectedDifficulty[0] : undefined,
        categoryIds: activeCategory ? [activeCategory] : [],
        status: selectedStatus.length > 0 ? selectedStatus[0].toUpperCase() : undefined,
        userId: user?.userId,
        sortBy: sortBy || undefined,
      }),
    );
  }, [dispatch, search, activeCategory, selectedDifficulty, selectedStatus, user?.userId, sortBy]);

  const problemMeta = meta as ProblemMeta;
  const totalCount = problemMeta.total || 0;
  const solvedCount = problemMeta.totalSolved || problems.filter((p) => p.status === "SOLVED").length || 0;
  const percentage = totalCount > 0 ? (solvedCount / totalCount) * 100 : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 min-h-screen bg-white">
      {/* 1. Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8">Problems_</h1>
        <div className="relative flex items-center gap-4">
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-8 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all border-2 flex-shrink-0 ${!activeCategory ? "bg-primary-1 border-primary-1 text-white shadow-xl" : "border-slate-300 text-slate-500 hover:border-slate-400"}`}
            >
              All_Archive
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => setActiveCategory(cat.categoryId)}
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
      </div>

      {/* 2. Controls Row */}
      <div className="flex flex-col lg:flex-row gap-6 items-center mb-12">
        <div className="relative flex-[3] w-full">
          <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by title or slug..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-md py-5 pl-16 pr-6 text-sm font-bold focus:border-primary-1 focus:bg-white outline-none transition-all text-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <SortDropdown sortBy={sortBy} onSortChange={setSortBy} options={SORT_OPTIONS} />

        <div className="flex items-center gap-5 bg-slate-50 border-2 border-slate-100 px-6 py-3 rounded-md min-w-[280px] h-[68px]">
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90">
              <circle cx="20" cy="20" r="18" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="20" cy="20" r="18" fill="transparent" stroke="#10b981" strokeWidth="4"
                strokeDasharray={113} strokeDashoffset={113 - (113 * percentage) / 100}
                strokeLinecap="round" className="transition-all duration-700 ease-in-out"
              />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Success_Rate</p>
            <p className="text-lg font-black text-slate-700 italic">
              <span className="text-emerald-500">{solvedCount}</span>
              <span className="mx-1 text-slate-300">/</span>
              <span className="text-slate-500">{totalCount}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 3. Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-4">
          {problems.map((prob: Problem, idx: number) => {
            const statusInfo = getStatusInfo(prob.status);
            return (
              <div key={prob.problemId} className={`flex items-center justify-between p-8 rounded-md transition-all border-2 border-transparent hover:border-primary-1/40 hover:shadow-sm ${idx % 2 === 0 ? "bg-slate-50" : "bg-white border-slate-100"}`}>
                <div className="flex items-center gap-8">
                  <span className="font-mono text-sm font-black text-slate-300">{(idx + 1).toString().padStart(2, "0")}</span>
                  <div>
                    <span className="font-black text-slate-900 uppercase text-lg block tracking-tight mb-1">{prob.title}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded uppercase">{prob.slug}</span>
                  </div>
                </div>
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`text-[11px] font-black uppercase ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <div className="text-right w-20">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Level</p>
                    <span className="text-[11px] font-black text-slate-900 uppercase">{prob.difficulty}</span>
                  </div>
                  <button className="px-8 py-3 border-2 border-primary-1 text-primary-1 text-[11px] font-black uppercase tracking-widest rounded hover:bg-primary-1 hover:text-white transition-all">Solve</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Filters */}
        <aside className="space-y-12 pl-6 border-l border-slate-100">
          <div>
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-8 border-b-4 border-slate-900 pb-2 inline-block">Filters_</h4>
            
            {/* Status Filter */}
            <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Submission_State</p>
            <div className="space-y-4 mb-10">
              {["Solved", "Unsolved", "Attempted"].map((status) => (
                <label key={status} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-black text-slate-600 uppercase group-hover:text-slate-900 transition-colors">{status}</span>
                  <div className={`h-7 w-7 border-2 rounded flex items-center justify-center transition-all ${selectedStatus.includes(status) ? "border-primary-1 bg-primary-1 text-white" : "border-slate-300 bg-white"}`}>
                    {selectedStatus.includes(status) && <FaCheck size={12} />}
                  </div>
                  <input
                    type="checkbox" className="hidden" checked={selectedStatus.includes(status)}
                    onChange={() => setSelectedStatus((prev) => prev.includes(status) ? [] : [status])}
                  />
                </label>
              ))}
            </div>

            {/* Difficulty Filter - RESTORED WORKING LOGIC */}
            <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Complexity_Scale</p>
            <div className="space-y-4">
              {["EASY", "MEDIUM", "HARD"].map((diff) => (
                <label key={diff} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-black text-slate-600 uppercase group-hover:text-slate-900 transition-colors">{diff}</span>
                  <div className={`h-7 w-7 border-2 rounded flex items-center justify-center transition-all ${selectedDifficulty.includes(diff) ? "border-primary-1 bg-primary-1 text-white" : "border-slate-300 bg-white"}`}>
                    {selectedDifficulty.includes(diff) && <FaCheck size={12} />}
                  </div>
                  <input
                    type="checkbox" className="hidden" checked={selectedDifficulty.includes(diff)}
                    onChange={() => setSelectedDifficulty((prev) => prev.includes(diff) ? [] : [diff])}
                  />
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}