"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useProblems } from "@/hooks/useProblems";
import { useCategories } from "@/hooks/useCategories";
import { FiSearch, FiFilter } from "react-icons/fi";
import SortDropdown from "@/components/problems/SortDropdown";
import CategoryBar from "@/components/problems/CategoryBar";
import FilterSidebar from "@/components/problems/FilterSidebar";
import ProblemListItem from "@/components/problems/ProblemListItem";
import ProgressCard from "@/components/problems/ProgressCard";
import { PROBLEM_SORT_OPTIONS } from "@/constants/constants";

export default function UserProblemsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const { data: problemsData, isLoading } = useProblems({
    page: 1,
    search: debouncedSearch,
    difficulty: selectedDifficulty[0],
    categoryIds: activeCategory ? [activeCategory] : [],
    status: selectedStatus[0]?.toUpperCase(),
    userId: user?.userId,
    sortBy: sortBy || undefined,
  });

  const problems = problemsData?.data ?? [];
  const meta = problemsData?.meta ?? { total: 0, page: 1, pages: 1 };
  const totalCount = meta.total || 0;
  const solvedCount = problems.filter((p: any) => p.status === "SOLVED").length;
  const activeFilterCount = selectedDifficulty.length + selectedStatus.length;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Page header ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-[10px] font-black text-primary-1 uppercase tracking-[0.3em] mb-2">
                Practice Arena
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Problems
              </h1>
            </div>
            <ProgressCard solvedCount={solvedCount} totalCount={totalCount} />
          </div>

          {/* Category bar */}
          <CategoryBar
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search + sort row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search problems..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-sm py-3 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-primary-1 focus:bg-white transition-all"
            />
          </div>
          <SortDropdown sortBy={sortBy} onSortChange={setSortBy} options={PROBLEM_SORT_OPTIONS} />
          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowMobileFilters((v) => !v)}
            className={`lg:hidden flex items-center gap-2 px-4 py-3 border-2 rounded-sm text-[11px] font-black uppercase tracking-widest transition-all ${showMobileFilters ? "border-primary-1 bg-primary-1/5 text-primary-1" : "border-slate-200 text-slate-500"}`}
          >
            <FiFilter size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-primary-1 text-white rounded-full text-[9px] flex items-center justify-center font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filters */}
        {showMobileFilters && (
          <div className="lg:hidden mb-6 p-5 bg-slate-50 border-2 border-slate-100 rounded-sm">
            <FilterSidebar
              selectedStatus={selectedStatus}
              selectedDifficulty={selectedDifficulty}
              onStatusChange={(s) => setSelectedStatus((prev) => (prev.includes(s) ? [] : [s]))}
              onDifficultyChange={(d) => setSelectedDifficulty((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Problem list */}
          <div className="lg:col-span-3">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isLoading ? "Loading..." : `${problems.length} of ${totalCount} problems`}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setSelectedDifficulty([]); setSelectedStatus([]); }}
                  className="text-[10px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-sm animate-pulse" />
                ))}
              </div>
            ) : problems.length > 0 ? (
              <div className="border-2 border-slate-100 rounded-sm overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-12 px-5 py-3 bg-slate-50 border-b-2 border-slate-100">
                  <div className="col-span-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">#</div>
                  <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Title</div>
                  <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Difficulty</div>
                  <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</div>
                  <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">XP</div>
                </div>
                {problems.map((prob: any, idx: number) => (
                  <ProblemListItem key={prob.problemId} prob={prob} idx={idx} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  No problems match your filters
                </p>
                <button
                  onClick={() => { setSearch(""); setSelectedDifficulty([]); setSelectedStatus([]); setActiveCategory(null); }}
                  className="mt-4 text-[10px] font-black text-primary-1 uppercase tracking-widest hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* Desktop filter sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 border-2 border-slate-100 rounded-sm p-5">
              <FilterSidebar
                selectedStatus={selectedStatus}
                selectedDifficulty={selectedDifficulty}
                onStatusChange={(s) => setSelectedStatus((prev) => (prev.includes(s) ? [] : [s]))}
                onDifficultyChange={(d) => setSelectedDifficulty((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
