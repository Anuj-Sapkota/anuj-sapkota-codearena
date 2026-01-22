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
  const solvedCount = problemMeta.totalSolved || problems.filter(p => p.status === "SOLVED").length || 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 min-h-screen bg-white">
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-8">
        Problems_
      </h1>

      <CategoryBar
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      <div className="flex flex-col lg:flex-row gap-6 items-center my-12">
        <div className="relative flex-[3] w-full">
          <FaSearch
            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full bg-slate-50 border-2 border-slate-200 rounded-md py-5 pl-16 pr-6 text-sm font-bold outline-none focus:border-primary-1"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <SortDropdown
          sortBy={sortBy}
          onSortChange={setSortBy}
          options={SORT_OPTIONS}
        />
        <ProgressCard solvedCount={solvedCount} totalCount={totalCount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-4">
          {problems.map((prob, idx) => (
            <ProblemListItem key={prob.problemId} prob={prob} idx={idx} />
          ))}
        </div>
        <FilterSidebar
          selectedStatus={selectedStatus}
          selectedDifficulty={selectedDifficulty}
          onStatusChange={(s) =>
            setSelectedStatus((prev) => (prev.includes(s) ? [] : [s]))
          }
          onDifficultyChange={(d) =>
            setSelectedDifficulty((prev) => (prev.includes(d) ? [] : [d]))
          }
        />
      </div>
    </div>
  );
}
