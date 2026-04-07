"use client";

import { useState, useMemo } from "react";
import { FiPlus, FiSearch, FiSliders, FiEdit3, FiTrash2, FiLoader, FiTag, FiBarChart2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import CreateCategoryModal from "@/components/admin/modals/CreateCategoryModal";
import CategoryFilterModal from "@/components/admin/modals/FilterCategoryModal";
import { useCategories, useDeleteCategory } from "@/hooks/useCategories";
import { Category } from "@/types/category.types";

type SortOption = "name_asc" | "name_desc" | "problems_high" | "problems_low";
type ActivityFilter = "all" | "yes" | "no";
interface FilterState { sortBy: SortOption; hasProblems: ActivityFilter; }

const ITEMS_PER_PAGE = 8;

export default function AdminCategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({ sortBy: "name_asc", hasProblems: "all" });

  const { data: categories = [], isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();

  const filteredItems = useMemo(() => {
    let result = [...categories];
    if (search) result = result.filter((c: Category) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
    );
    if (filters.hasProblems === "yes") result = result.filter((c: Category) => (c._count?.problems || 0) > 0);
    if (filters.hasProblems === "no")  result = result.filter((c: Category) => (c._count?.problems || 0) === 0);
    result.sort((a: Category, b: Category) => {
      if (filters.sortBy === "name_asc")      return a.name.localeCompare(b.name);
      if (filters.sortBy === "name_desc")     return b.name.localeCompare(a.name);
      if (filters.sortBy === "problems_high") return (b._count?.problems || 0) - (a._count?.problems || 0);
      if (filters.sortBy === "problems_low")  return (a._count?.problems || 0) - (b._count?.problems || 0);
      return 0;
    });
    return result;
  }, [categories, search, filters]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const hasActiveFilters = filters.sortBy !== "name_asc" || filters.hasProblems !== "all";
  const totalProblems = categories.reduce((acc: number, c: Category) => acc + (c._count?.problems || 0), 0);

  const handleDelete = (cat: Category) => {
    if (window.confirm(`Delete "${cat.name}"?`)) deleteCategory.mutate(cat.categoryId);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Categories<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Taxonomy management
          </p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all active:scale-95 shrink-0"
        >
          <FiPlus size={13} /> New Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
            <FiTag size={15} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Categories</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{categories.length}</p>
          </div>
        </div>
        <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
            <FiBarChart2 size={15} className="text-slate-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Problems Tagged</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{totalProblems}</p>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border-2 border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2.5 rounded-sm hover:border-slate-900 transition-colors group shrink-0"
        >
          <FiSliders size={13} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Filters</span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 bg-primary-1 rounded-full" />}
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white border-2 border-slate-100 rounded-sm">
          <FiLoader className="animate-spin text-slate-300" size={28} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Loading</p>
        </div>
      ) : paginatedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
          <FiTag size={28} className="text-slate-200 mb-2" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No categories found</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-slate-50/60">
                  {["Category", "Slug", "Problems", "Actions"].map((h, i) => (
                    <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 3 ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((cat: Category) => (
                  <tr key={cat.categoryId} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Name + description */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-1 shrink-0" />
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{cat.name}</p>
                          {cat.description && (
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-1 max-w-xs">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-[11px] font-mono text-primary-1">/{cat.slug}</span>
                    </td>

                    {/* Problem count */}
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-black text-slate-700 tabular-nums">
                        {cat._count?.problems || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }}
                          className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-primary-1 hover:border-primary-1/40 transition-all"
                        >
                          <FiEdit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-sm px-5 py-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {filteredItems.length} categories · page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
              <FiChevronLeft size={13} />
            </button>
            <span className="text-[10px] font-black text-slate-900 px-3 py-1.5 border-2 border-slate-100 rounded-sm bg-slate-50 tabular-nums">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              disabled={currentPage >= totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
              <FiChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      <CreateCategoryModal
        key={editingCategory?.categoryId || "new"}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null); }}
        editData={editingCategory}
      />
      <CategoryFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={(f) => { setFilters(f); setCurrentPage(1); }}
      />
    </div>
  );
}
