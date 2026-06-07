"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FiSearch, FiLoader, FiBookOpen, FiPlay, FiInbox,
  FiLock, FiUnlock, FiCheckCircle, FiChevronLeft,
  FiChevronRight, FiEye, FiFilter, FiX,
} from "react-icons/fi";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LearnPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [resources, setResources] = useState<any[]>([]);
  const [meta, setMeta] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Debounce search — 400ms
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        sortBy,
        page: String(page),
        limit: "9",
      });
      const res = await fetch(`${API}/resources/explore?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResources(data.items || []);
      setMeta(data.meta || { total: 0, pages: 1, page: 1 });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortBy, page]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 mb-2">
            Learning <span className="text-primary-1 italic">Resources</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Browse courses and series created by verified instructors.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 py-3 pl-11 pr-10 text-sm font-medium rounded-sm focus:outline-none focus:border-primary-1 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="bg-white border border-slate-200 py-3 pl-9 pr-8 text-[11px] font-black uppercase tracking-wider rounded-sm focus:outline-none focus:border-primary-1 transition-all appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">
            {meta.total} course{meta.total !== 1 ? "s" : ""} found
            {debouncedSearch && <> for "<span className="text-slate-700">{debouncedSearch}</span>"</>}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <FiLoader className="animate-spin text-primary-1" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Loading Courses</p>
          </div>
        ) : error ? (
          <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-sm">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">Failed to load courses</p>
            <button onClick={fetchResources} className="bg-slate-900 text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-slate-700 transition-all">
              Retry
            </button>
          </div>
        ) : resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <Link
                key={res.id}
                href={res.isOwned ? `/resource/${res.id}` : `/learn/${res.id}`}
                className="group bg-white border border-slate-200 rounded-sm overflow-hidden hover:border-primary-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-slate-100 overflow-hidden">
                  {res.thumbnail
                    ? <img src={res.thumbnail} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    : <div className="w-full h-full flex items-center justify-center"><FiBookOpen size={28} className="text-slate-300" /></div>}

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    {res.isOwned ? (
                      <span className="flex items-center gap-1 bg-emerald-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-sm">
                        <FiCheckCircle size={9} /> Enrolled
                      </span>
                    ) : res.price === 0 ? (
                      <span className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-sm">
                        <FiUnlock size={9} /> Free
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-sm tracking-wider shadow-sm">
                        <FiLock size={9} /> Premium
                      </span>
                    )}
                  </div>

                  {/* Module count */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-black uppercase px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                    <FiPlay size={9} /> {res.moduleCount || 0} lessons
                  </div>

                  {/* Views */}
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-500 text-[9px] font-bold px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                    <FiEye size={9} /> {res.views || 0}
                  </div>

                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
                      <FiPlay className="fill-current translate-x-0.5 text-slate-900" size={16} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black uppercase tracking-tight text-slate-900 text-sm mb-2 line-clamp-2 group-hover:text-primary-1 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4 flex-1">
                    {res.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <img
                        src={res.creator?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(res.creator?.name || "C")}&size=32`}
                        className="w-6 h-6 rounded-full border border-slate-200"
                        alt={res.creator?.name}
                      />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[100px]">
                        {res.creator?.name || "Instructor"}
                      </span>
                    </div>
                    <span className={`text-sm font-black italic tracking-tighter ${res.isOwned ? "text-emerald-600" : "text-slate-900"}`}>
                      {res.isOwned ? "OWNED" : res.price === 0 ? "FREE" : `NPR ${res.price?.toLocaleString()}`}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center border-2 border-dashed border-slate-200 rounded-sm">
            <FiInbox className="text-slate-300 mx-auto mb-4" size={48} />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 italic">No Courses Found</h3>
            {debouncedSearch && (
              <button onClick={() => setSearch("")} className="mt-4 text-[10px] font-black uppercase text-primary-1 tracking-wider hover:underline">
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white text-[10px] font-black uppercase tracking-wider rounded-sm hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <FiChevronLeft size={13} /> Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: meta.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === meta.pages || Math.abs(p - page) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-[10px] font-bold">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`w-9 h-9 text-[11px] font-black rounded-sm border transition-all ${
                        page === p
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
              disabled={page === meta.pages}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white text-[10px] font-black uppercase tracking-wider rounded-sm hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <FiChevronRight size={13} />
            </button>
          </div>
        )}

        {/* Page info */}
        {!loading && meta.pages > 1 && (
          <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-3">
            Page {page} of {meta.pages} · {meta.total} total courses
          </p>
        )}

      </div>
    </div>
  );
}
