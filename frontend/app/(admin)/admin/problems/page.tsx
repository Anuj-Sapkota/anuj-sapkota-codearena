"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import { fetchProblemsThunk, deleteProblemThunk } from "@/lib/store/features/problems/problem.actions";
import { Problem } from "@/types/problem.types";
import { toast } from "sonner";

// Sub-components
import ProblemStats from "@/components/admin/ProblemStats";
import ProblemControls from "@/components/admin/ProblemControls";
import ProblemTable from "@/components/admin/ProblemTable";
import CreateProblemModal from "@/components/admin/modals/CreateProblemModal";
import ProblemFilterModal, { ProblemFilterState } from "@/components/admin/modals/FilterProblemModal";

export default function AdminProblemsPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  
  // Table State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProblemFilterState>({
    sortBy: "newest",
    difficulty: "ALL",
    categoryIds: [],
  });

  const { problems, isLoading, meta } = useSelector((state: RootState) => state.problem);

  // 1. Handle Search Debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); 
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Fetch Data from Server
  useEffect(() => {
    dispatch(fetchProblemsThunk({
      page: currentPage,
      search: debouncedSearch,
      difficulty: filters.difficulty,
      categoryIds: filters.categoryIds,
      sortBy: filters.sortBy
    }));
  }, [dispatch, currentPage, debouncedSearch, filters]);

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`CONFIRM_DELETION: ${title.toUpperCase()}?`)) {
      try {
        await dispatch(deleteProblemThunk(id)).unwrap();
        toast.success("REGISTRY_ENTRY_REMOVED");
      } catch (err) {
        toast.error("DELETION_FAILED");
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 px-2 sm:px-0">
      <ProblemControls 
        search={search}
        setSearch={setSearch}
        onOpenModal={() => { setEditingProblem(null); setIsModalOpen(true); }}
        onOpenFilter={() => setIsFilterOpen(true)}
        hasActiveFilters={filters.difficulty !== "ALL" || filters.categoryIds.length > 0}
      />

      <ProblemStats totalProblems={meta.total} />

      <ProblemTable 
        items={problems}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onEdit={(prob) => { setEditingProblem(prob); setIsModalOpen(true); }}
        onDelete={handleDelete}
        totalPages={meta.pages} // Fixed: Passing totalPages from Redux meta
      />

      <CreateProblemModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProblem(null); }}
        initialData={editingProblem} 
      />

      <ProblemFilterModal 
        // Fixed: Key resets internal state when modal opens, avoiding useEffect sync error
        key={isFilterOpen ? "filter-open" : "filter-closed"}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}