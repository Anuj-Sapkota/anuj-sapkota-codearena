"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProblems, useDeleteProblem } from "@/hooks/useProblems";
import { Problem } from "@/types/problem.types";
import api from "@/lib/api";
import { API } from "@/constants/api.constants";

import ProblemStats from "@/components/admin/ProblemStats";
import ProblemControls from "@/components/admin/ProblemControls";
import ProblemTable from "@/components/admin/ProblemTable";
import CreateProblemModal from "@/components/admin/modals/CreateProblemModal";
import ProblemFilterModal, { ProblemFilterState } from "@/components/admin/modals/FilterProblemModal";

export default function AdminProblemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProblemFilterState>({
    sortBy: "newest",
    difficulty: "ALL",
    categoryIds: [],
  });

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(1); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading } = useProblems({
    page: currentPage,
    search: debouncedSearch,
    difficulty: filters.difficulty,
    categoryIds: filters.categoryIds,
    sortBy: filters.sortBy,
  });

  // Pull difficulty breakdown from the admin stats endpoint
  const { data: adminStats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get(API.ADMIN.STATS)).data,
    staleTime: 60_000,
  });

  const problems = data?.data ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pages: 1 };

  const diffMap = Object.fromEntries(
    (adminStats?.difficultyBreakdown ?? []).map((d: any) => [d.difficulty, d.count])
  );

  const deleteProblem = useDeleteProblem();

  const handleDelete = async (id: number, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) deleteProblem.mutate(id);
  };

  return (
    <div className="space-y-6 pb-10">
      <ProblemControls
        search={search}
        setSearch={setSearch}
        onOpenModal={() => { setEditingProblem(null); setIsModalOpen(true); }}
        onOpenFilter={() => setIsFilterOpen(true)}
        hasActiveFilters={filters.difficulty !== "ALL" || filters.categoryIds.length > 0}
      />
      <ProblemStats
        totalProblems={meta.total}
        easy={diffMap["EASY"] ?? 0}
        medium={diffMap["MEDIUM"] ?? 0}
        hard={diffMap["HARD"] ?? 0}
        acceptanceRate={adminStats?.counts?.acceptanceRate}
      />
      <ProblemTable
        items={problems}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onEdit={(prob) => { setEditingProblem(prob); setIsModalOpen(true); }}
        onDelete={handleDelete}
        totalPages={meta.pages}
      />
      <CreateProblemModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingProblem(null); }}
        initialData={editingProblem}
      />
      <ProblemFilterModal
        key={isFilterOpen ? "open" : "closed"}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={(f) => { setFilters(f); setCurrentPage(1); }}
      />
    </div>
  );
}
