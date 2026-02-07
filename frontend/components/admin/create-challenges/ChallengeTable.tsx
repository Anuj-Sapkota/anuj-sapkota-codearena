"use client";

import { FaEdit, FaTrashAlt, FaSpinner, FaChevronLeft, FaChevronRight, FaTrophy } from "react-icons/fa";
import { Challenge } from "@/types/challenge.types";

interface Props {
  items: Challenge[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  onEdit: (c: Challenge) => void;
  onDelete: (id: number, title: string) => void; 
  totalPages: number;
}

export default function ChallengeTable({ 
  items, isLoading, currentPage, setCurrentPage, onEdit, onDelete, totalPages 
}: Props) {

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white border-2 border-gray-200 rounded-md">
        <FaSpinner className="animate-spin text-emerald-500" size={32} />
        <p className="text-slate-400 text-[10px] font-black uppercase mt-4 tracking-widest">Synchronizing_Contests</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-gray-200 rounded-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80 border-b-2 border-gray-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contest_Identity</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visibility</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Dataset_Size</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((challenge) => (
                <tr key={challenge.challengeId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 flex items-center justify-center rounded border border-slate-200 text-slate-400">
                        <FaTrophy size={16} />
                      </div>
                      <div>
                        <span className="font-black text-slate-900 uppercase text-sm block tracking-tight">{challenge.title}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5 uppercase tracking-tighter">/{challenge.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-widest ${
                      challenge.isPublic 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {challenge.isPublic ? "Public_Access" : "Draft_Only"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-[10px] text-slate-500 tabular-nums">
                    {/* Check problems array length first (for fresh updates), then _count (for initial lists) */}
                    {(challenge.problems?.length ?? challenge._count?.problems ?? 0)} PROBLEMS_LINKED
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onEdit(challenge)} 
                        className="h-10 w-10 border-2 border-gray-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 rounded-md transition-all cursor-pointer"
                        title="Edit Challenge"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={() => onDelete(challenge.challengeId, challenge.title)} 
                        className="h-10 w-10 border-2 border-gray-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 rounded-md transition-all cursor-pointer"
                        title="Delete Challenge"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white border-2 border-gray-200 p-4 rounded-md shadow-sm">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {currentPage} / {totalPages || 1}</span>
         <div className="flex gap-2">
            <button 
              disabled={currentPage === 1 || isLoading} 
              onClick={() => setCurrentPage(currentPage - 1)} 
              className="p-3 border-2 border-gray-200 rounded-md hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <FaChevronLeft size={12}/>
            </button>
            <button 
              disabled={currentPage >= totalPages || isLoading} 
              onClick={() => setCurrentPage(currentPage + 1)} 
              className="p-3 border-2 border-gray-200 rounded-md hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <FaChevronRight size={12}/>
            </button>
         </div>
      </div>
    </div>
  );
}