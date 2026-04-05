"use client";

import { useState } from "react";
import { FaPlus, FaTrophy, FaSearch, FaEye } from "react-icons/fa";
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

  const handleDelete = (id: number, title: string) => {
    if (window.confirm(`CONFIRM_DELETION: ${title.toUpperCase()}?`))
      deleteChallenge.mutate(id);
  };

  const publicCount = challenges.filter((c: Challenge) => c.isPublic).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8 px-2 sm:px-0">
        <div>
          <h1 className="text-4xl font-black text-darkest tracking-tight uppercase">Challenges<span className="text-primary-1">.</span></h1>
          <p className="text-muted text-sm font-medium mt-1 uppercase tracking-widest">Registry Control Panel</p>
        </div>
        <button onClick={() => { setEditingChallenge(null); setIsModalOpen(true); }}
          className="bg-primary-1 hover:bg-primary-2 text-white px-8 py-3 rounded-md font-black uppercase text-xs tracking-widest border border-primary-2 cursor-pointer transition-all active:scale-95 shadow-lg shadow-primary-1/10">
          <FaPlus size={12} className="inline mr-2" /> Create Challenge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2 sm:px-0">
        <div className="bg-white p-6 border-2 border-gray-200 rounded-md flex items-center justify-between shadow-sm">
          <div><p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Total_Registry</p><p className="text-3xl font-black text-darkest mt-1 italic">{meta?.total || 0}</p></div>
          <div className="h-14 w-14 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-primary-1"><FaTrophy size={24} /></div>
        </div>
        <div className="bg-white p-6 border-2 border-gray-200 rounded-md flex items-center justify-between shadow-sm">
          <div><p className="text-muted text-[10px] font-black uppercase tracking-[0.2em]">Published_Live</p><p className="text-3xl font-black text-darkest mt-1 italic">{publicCount}</p></div>
          <div className="h-14 w-14 bg-gray-50 rounded-md border border-gray-100 flex items-center justify-center text-darkest"><FaEye size={24} /></div>
        </div>
      </div>

      <div className="px-2 sm:px-0">
        <div className="relative w-full md:w-96">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input type="text" placeholder="FILTER_CHALLENGES..." value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border-2 border-gray-200 rounded-md py-3 pl-11 pr-4 text-xs font-black uppercase tracking-widest outline-none focus:border-primary-1 transition-all" />
        </div>
      </div>

      <div className="px-2 sm:px-0">
        <ChallengeTable items={challenges} isLoading={isLoading} currentPage={currentPage}
          setCurrentPage={setCurrentPage} onEdit={(c) => { setEditingChallenge(c); setIsModalOpen(true); }}
          onDelete={handleDelete} totalPages={meta?.pages || 1} />
      </div>

      <CreateChallengeModal isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingChallenge(null); }}
        editData={editingChallenge} />
    </div>
  );
}
