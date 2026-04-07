"use client";

import { useState } from "react";
import { FiPlus, FiSearch, FiTrendingUp, FiEye } from "react-icons/fi";
import { LuSwords } from "react-icons/lu";
import { Challenge } from "@/types/challenge.types";
import { useChallenges, useDeleteChallenge } from "@/hooks/useChallenges";
import ChallengeTable from "@/components/admin/create-challenges/ChallengeTable";
import CreateChallengeModal from "@/components/admin/modals/CreateChallengeModal";

export default function AdminChallengesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useChallenges({ page: currentPage, limit: 7, search });
  const challenges = data?.items ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, pages: 1 };
  const deleteChallenge = useDeleteChallenge();

  const publicCount = challenges.filter((c: Challenge) => c.isPublic).length;

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`Delete "${title}"?`)) deleteChallenge.mutate(id);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Challenges<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Contest management
          </p>
        </div>
        <button
          onClick={() => { setEditingChallenge(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all active:scale-95 shrink-0"
        >
          <FiPlus size={13} /> New Challenge
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
            <LuSwords size={15} className="text-violet-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Challenges</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{meta.total}</p>
          </div>
        </div>
        <div className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
            <FiEye size={15} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Published Live</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{publicCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="w-full bg-white border-2 border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors"
        />
      </div>

      <ChallengeTable
        items={challenges}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onEdit={(c) => { setEditingChallenge(c); setIsModalOpen(true); }}
        onDelete={handleDelete}
        totalPages={meta.pages || 1}
      />

      <CreateChallengeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingChallenge(null); }}
        editData={editingChallenge}
      />
    </div>
  );
}
