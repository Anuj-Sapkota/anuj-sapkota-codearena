"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useProblems } from "@/hooks/useProblems";
import { useCategories } from "@/hooks/useCategories";
import { FaSearch } from "react-icons/fa";
import SortDropdown from "@/components/problems/SortDropdown";
import CategoryBar from "@/components/problems/CategoryBar";
import FilterSidebar from "@/components/problems/FilterSidebar";
import ProblemListItem from "@/components/problems/ProblemListItem";
import ProgressCard from "@/components/problems/ProgressCard";

const SORT_OPTIONS = [
  { label: "Newest Added", value: "" },
  { label: "Title (A - Z)", value: "title_asc" },
  { label: "Title (Z - A)", value: "title_desc" },
];

export default function UserProblemsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");

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

  return (
    <div className="w-full flex justify-center bg-white min-h-screen">
      <div className="w-full max-w-[1400px] px-4 md:px-10 py-8 md:py-16">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter mb-10 text-center md:text-left">
          Problems_
        </h1>

        <CategoryBar
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />

        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center my-10 md:my-14">
          <div className="relative flex-23">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Filter by Problem name..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-md py-4 md:py-5 pl-16 pr-6 text-sm font-bold outline-none focus:border-primary-1 focus:bg-white transition-all shadow-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
            <SortDropdown sortBy={sortBy} onSortChange={setSortBy} options={SORT_OPTIONS} />
            <ProgressCard solvedCount={solvedCount} totalCount={totalCount} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-5">
            {problems.length > 0 ? (
              problems.map((prob: any, idx: number) => (
                <ProblemListItem key={prob.problemId} prob={prob} idx={idx} />
              ))
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-slate-400 font-bold uppercase tracking-widest">
                  No problems found matching your filters.
                </p>
              </div>
            )}
          </div>
          <FilterSidebar
            selectedStatus={selectedStatus}
            selectedDifficulty={selectedDifficulty}
            onStatusChange={(s: string) => setSelectedStatus((prev) => (prev.includes(s) ? [] : [s]))}
            onDifficultyChange={(d: string) => setSelectedDifficulty((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))}
          />
        </div>
      </div>
    </div>
  );
}

