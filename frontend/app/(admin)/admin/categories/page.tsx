"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaPlus,
  FaTrashAlt,
  FaFolderOpen,
  FaChartLine,
  FaSpinner,
  FaEdit,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaSlidersH,
} from "react-icons/fa";
import CreateCategoryModal from "@/components/admin/modals/CreateCategoryModal";
import CategoryFilterModal from "@/components/admin/modals/FilterCategoryModal";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  fetchCategoriesThunk,
  deleteCategoryThunk,
} from "@/lib/store/features/category/category.actions";
import { Category } from "@/types/category.types";

// 1. Explicitly define types to solve the TypeScript comparison error
type SortOption = "name_asc" | "name_desc" | "problems_high" | "problems_low";
type ActivityFilter = "all" | "yes" | "no";

interface FilterState {
  sortBy: SortOption;
  hasProblems: ActivityFilter;
}

export default function AdminCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 2. State typed with the interface above
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "name_asc",
    hasProblems: "all",
  });

  const { items: categories, isLoading } = useSelector(
    (state: RootState) => state.category,
  );

  useEffect(() => {
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  // Combined Search, Sort, and Filter Logic
  const filteredItems = useMemo(() => {
    let result = [...categories];

    // 1. Search
    if (search) {
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase()) ||
          cat.slug.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // 2. Activity Filter - No longer triggers TS errors
    if (filters.hasProblems === "yes")
      result = result.filter((c) => (c._count?.problems || 0) > 0);
    if (filters.hasProblems === "no")
      result = result.filter((c) => (c._count?.problems || 0) === 0);

    // 3. Sorting
    result.sort((a, b) => {
      if (filters.sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (filters.sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (filters.sortBy === "problems_high")
        return (b._count?.problems || 0) - (a._count?.problems || 0);
      if (filters.sortBy === "problems_low")
        return (a._count?.problems || 0) - (b._count?.problems || 0);
      return 0;
    });

    return result;
  }, [categories, search, filters]);

  // Pagination Logic
  const itemsPerPage = 7;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8 px-2 sm:px-0">
        <div>
          <h1 className="text-4xl font-black text-darkest tracking-tight uppercase">
            Categories<span className="text-primary-1">.</span>
          </h1>
          <p className="text-muted text-sm font-medium mt-1 uppercase tracking-widest">
            System Taxonomy Management
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-primary-1 hover:bg-primary-2 text-white px-8 py-3 rounded-md font-black uppercase text-xs tracking-widest border border-primary-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-primary-1/10"
        >
          <FaPlus size={12} className="inline mr-2" /> Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 sm:px-0">
        <div className="bg-white p-6 border-2 border-gray-200 rounded-md flex items-center justify-between">
          <div>
            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Total</p>
            <p className="text-3xl font-black text-darkest mt-1 italic">{categories.length}</p>
          </div>
          <div className="h-14 w-14 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-primary-1">
            <FaFolderOpen size={24} />
          </div>
        </div>
        <div className="bg-white p-6 border-2 border-gray-200 rounded-md flex items-center justify-between">
          <div>
            <p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Usage</p>
            <p className="text-3xl font-black text-darkest mt-1 italic">
              {categories.reduce((acc, c) => acc + (c._count?.problems || 0), 0)}
            </p>
          </div>
          <div className="h-14 w-14 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-darkest">
            <FaChartLine size={24} />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 px-2 sm:px-0">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border-2 border-gray-200 rounded-md py-3 pl-11 pr-4 text-xs font-black uppercase tracking-widest outline-none focus:border-primary-1/40 transition-all"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 px-6 py-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors group"
        >
          <FaSlidersH className="text-muted group-hover:text-primary-1 transition-colors" size={14} />
          <span className="text-xs font-black text-muted uppercase tracking-widest group-hover:text-darkest">Filters</span>
          {(filters.sortBy !== "name_asc" || filters.hasProblems !== "all") && (
            <span className="h-2 w-2 bg-primary-1 rounded-full shadow-[0_0_8px_rgba(46,200,102,1)]" />
          )}
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border-2 border-gray-200 rounded-md overflow-hidden mx-2 sm:mx-0">
        {isLoading && categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80">
            <FaSpinner className="animate-spin text-primary-1" size={32} />
            <p className="text-muted text-[10px] font-black uppercase mt-4 tracking-widest">Fetching Data</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 border-b-2 border-gray-200">
                  <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest hidden sm:table-cell">Slug</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-center">Count</th>
                  <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedItems.map((cat) => (
                  <tr key={cat.categoryId} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-2 bg-primary-1 shrink-0" />
                        <div>
                          <span className="font-black text-darkest uppercase text-sm block tracking-tight">{cat.name}</span>
                          <span className="text-[10px] text-muted font-bold block mt-0.5 line-clamp-1 max-w-[150px] sm:max-w-xs uppercase">
                            {cat.description || "No description"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell font-code text-[11px] text-primary-1">
                      /{cat.slug}
                    </td>
                    <td className="px-6 py-5 text-center font-black text-darkest tabular-nums">
                      {cat._count?.problems || 0}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(cat)} className="h-10 w-10 border-2 border-gray-200 flex items-center justify-center text-muted hover:text-primary-1 hover:border-primary-1/40 rounded-md transition-all cursor-pointer">
                          <FaEdit size={16} />
                        </button>
                        <button onClick={() => confirm("Delete?") && dispatch(deleteCategoryThunk(cat.categoryId))} className="h-10 w-10 border-2 border-gray-200 flex items-center justify-center text-muted hover:text-red-500 hover:border-red-200 rounded-md transition-all cursor-pointer">
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-2 border-gray-200 p-4 rounded-md mx-2 sm:mx-0">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest">
          {filteredItems.length} Categories found
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="h-12 w-12 border-2 border-gray-200 flex items-center justify-center rounded-md hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all"
          >
            <FaChevronLeft size={14} />
          </button>
          <div className="flex items-center px-6 h-12 border-2 border-gray-200 rounded-md text-[10px] font-black text-darkest uppercase tracking-widest bg-gray-50/50">
            {currentPage} / {totalPages || 1}
          </div>
          <button
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="h-12 w-12 border-2 border-gray-200 flex items-center justify-center rounded-md hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Modals */}
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
        setFilters={setFilters}
      />
    </div>
  );
}