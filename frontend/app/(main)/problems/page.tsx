"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchProblemsThunk } from "@/lib/store/features/problems/problem.actions";
import { fetchCategoriesThunk } from "@/lib/store/features/category/category.actions";
import { FaSearch } from "react-icons/fa";
import { Problem, ProblemMeta } from "@/types/problem.types";
import SortDropdown from "@/components/problems/SortDropdown";
import CategoryBar from "@/components/problems/CategoryBar";
import FilterSidebar from "@/components/problems/FilterSidebar";
import ProblemListItem from "@/components/problems/ProblemListItem"; // (Optional: Move the row JSX here)
import ProgressCard from "@/components/problems/ProgressCard";

const SORT_OPTIONS = [
  { label: "Newest Added", value: "" },
  { label: "Title (A - Z)", value: "title_asc" },
  { label: "Title (Z - A)", value: "title_desc" },
];

export default function UserProblemsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { problems, meta } = useSelector((state: RootState) => state.problem);
  const { items: categories } = useSelector(
    (state: RootState) => state.category,
  );

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProblemsThunk({
        page: 1,
        search,
        difficulty: selectedDifficulty[0],
        categoryIds: activeCategory ? [activeCategory] : [],
        status: selectedStatus[0]?.toUpperCase(),
        userId: user?.userId,
        sortBy: sortBy || undefined,
      }),
    );
  }, [
    dispatch,
    search,
    activeCategory,
    selectedDifficulty,
    selectedStatus,
    user?.userId,
    sortBy,
  ]);

  const problemMeta = meta as ProblemMeta;
  const totalCount = problemMeta.total || 0;
  const solvedCount =
    problemMeta.totalSolved ||
    problems.filter((p) => p.status === "SOLVED").length ||
    0;

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

        {/* Improved Responsive Controls */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center my-10 md:my-14">
          <div className="relative flex-[3]">
            <FaSearch
              className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter by challenge name..."
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-md py-4 md:py-5 pl-16 pr-6 text-sm font-bold outline-none focus:border-primary-1 focus:bg-white transition-all shadow-sm"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
            <SortDropdown
              sortBy={sortBy}
              onSortChange={setSortBy}
              options={SORT_OPTIONS}
            />
            <ProgressCard solvedCount={solvedCount} totalCount={totalCount} />
          </div>
        </div>

        {/* Main Grid: Content stays centered because of the 1400px wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3 space-y-5">
            {problems.length > 0 ? (
              problems.map((prob, idx) => (
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

          {/* Sidebar logic */}
          <FilterSidebar
            selectedStatus={selectedStatus}
            selectedDifficulty={selectedDifficulty}
            // Type the 's' as string
            onStatusChange={(s: string) =>
              setSelectedStatus((prev) => (prev.includes(s) ? [] : [s]))
            }
            // Type the 'd' as string
            onDifficultyChange={(d: string) =>
              setSelectedDifficulty((prev) => (prev.includes(d) ? [] : [d]))
            }
          />
        </div>
      </div>
    </div>
  );
}
