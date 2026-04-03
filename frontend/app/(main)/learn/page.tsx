"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiSearch,
  FiArrowUpRight,
  FiLoader,
  FiBookOpen,
  FiPlay,
  FiAlertCircle,
  FiInbox,
  FiLayers,
  FiLock,
  FiUnlock,
  FiCheckCircle,
} from "react-icons/fi";
import Link from "next/link";
import { resourceService } from "@/lib/services/resource.service";

export default function LearnPage() {
  const [search, setSearch] = useState("");

  const {
    data: resources,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["resources", "explore", search],
    queryFn: () => resourceService.getExploreResources(search),
    placeholderData: (previousData) => previousData,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] selection:bg-black selection:text-white font-sans">
      <div className="fixed inset-0 z-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 bg-black flex items-center justify-center rounded-xl shadow-2xl shadow-black/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <FiBookOpen className="text-white" size={22} />
            </div>
            <div className="hidden sm:block">
              <span className="block text-[12px] font-black uppercase tracking-[0.4em] leading-none mb-1">
                CodeArena
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Knowledge Base
              </span>
            </div>
          </div>

          <div className="relative w-full max-w-lg mx-8 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" />
            <input
              type="text"
              placeholder="Search architecture..."
              className="w-full bg-slate-100/50 border border-transparent py-3.5 pl-12 pr-4 rounded-full text-sm font-medium transition-all focus:bg-white focus:ring-4 focus:ring-black/5 focus:border-black/10 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-[11px] font-black uppercase tracking-widest hover:text-slate-500 transition-colors"
            >
              My Learning
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="relative pt-32 pb-20 px-6 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[10px] font-black text-white uppercase tracking-[0.2em] rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Catalog
          </div>
          <h1 className="text-7xl md:text-[120px] font-black uppercase tracking-tighter leading-[0.85] mb-8">
            Build <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-200">
              Beyond.
            </span>
          </h1>
        </div>
      </section>

      {/* --- MAIN GRID --- */}
      <main className="max-w-7xl mx-auto pb-32 px-6 relative z-10">
        {isLoading && !resources ? (
          <div className="flex flex-col items-center justify-center py-48 gap-6">
            <FiLoader className="animate-spin text-black" size={40} />
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">
              Syncing Intelligence
            </p>
          </div>
        ) : isError ? (
          <div className="max-w-md mx-auto py-40 text-center bg-white border border-slate-200 rounded-3xl p-12 shadow-sm">
            <FiAlertCircle className="text-red-500 mx-auto mb-6" size={32} />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
              Uplink Failed
            </h3>
            <button
              onClick={() => refetch()}
              className="w-full py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest mt-6 rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
            {resources && resources.length > 0 ? (
              resources.map((res: any) => (
                <Link
                  /* 🚀 DYNAMIC ROUTING: Now works for both Creators and Buyers via backend isOwned flag */
                  href={
                    res.isOwned ? `/resource/${res.id}` : `/learn/${res.id}`
                  }
                  key={res.id}
                  className="group relative flex flex-col"
                >
                  {/* CARD IMAGE */}
                  <div className="relative aspect-[16/10] mb-8 overflow-hidden rounded-[2rem] bg-slate-200 shadow-2xl shadow-black/5 border border-white">
                    <img
                      src={res.thumbnail || "/api/placeholder/800/600"}
                      alt={res.title}
                      className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
                    />

                    {/* STATUS BADGE */}
                    <div className="absolute top-5 right-5 z-20">
                      {res.isOwned ? (
                        <span className="px-3 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg">
                          <FiCheckCircle size={10} /> Enrolled
                        </span>
                      ) : res.price === 0 ? (
                        <span className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg">
                          <FiUnlock size={10} /> Open Access
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-2 shadow-lg">
                          <FiLock size={10} /> Premium
                        </span>
                      )}
                    </div>

                    <div className="absolute top-5 left-5 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center gap-2">
                      <FiLayers size={14} className="text-black" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {res.moduleCount || 0} Modules
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-500">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl text-black">
                        <FiPlay
                          className="fill-current translate-x-0.5"
                          size={20}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD CONTENT */}
                  <div className="px-2">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-3xl font-black uppercase tracking-tighter leading-[0.9] group-hover:translate-x-2 transition-transform duration-500">
                        {res.title}
                      </h3>
                      <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <FiArrowUpRight size={18} />
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
                      {res.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            res.creator?.avatar ||
                            `https://ui-avatars.com/api/?name=${res.creator?.name}`
                          }
                          className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                          alt="Creator"
                        />
                        <span className="text-[10px] font-black uppercase text-black">
                          {res.creator?.name || "Architect"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-2xl font-black italic tracking-tighter ${res.isOwned ? "text-emerald-600" : ""}`}
                        >
                          {res.isOwned
                            ? "OWNED"
                            : res.price === 0
                              ? "FREE"
                              : `$${res.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
                <FiInbox className="text-slate-300 mx-auto mb-6" size={60} />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 italic">
                  No Resources Found
                </h3>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
