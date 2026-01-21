"use client";

import { FaEdit, FaTrashAlt, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Problem } from "@/types/problem.types";

interface Props {
  items: Problem[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  onEdit: (p: Problem) => void;
  onDelete: (id: number, title: string) => void;
  totalPages: number; // Prop passed from meta.pages
}

export default function ProblemTable({ 
  items, 
  isLoading, 
  currentPage, 
  setCurrentPage, 
  onEdit, 
  onDelete,
  totalPages 
}: Props) {

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "EASY": return "text-green-500 border-green-100 bg-green-50";
      case "MEDIUM": return "text-yellow-600 border-yellow-100 bg-yellow-50";
      case "HARD": return "text-red-500 border-red-100 bg-red-50";
      default: return "text-gray-500 border-gray-100 bg-gray-50";
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 bg-white border-2 border-gray-200 rounded-md">
        <FaSpinner className="animate-spin text-primary-1" size={32} />
        <p className="text-muted text-[10px] font-black uppercase mt-4 tracking-widest">Compiling Index</p>
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
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest">Difficulty</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-center">Resources</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((prob) => ( // No more .slice() - render full items array
                <tr key={prob.problemId} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-2 w-2 bg-darkest shrink-0" />
                      <div>
                        <span className="font-black text-darkest uppercase text-sm block tracking-tight">{prob.title}</span>
                        <span className="text-[10px] text-primary-1 font-bold block mt-0.5 uppercase tracking-tighter">/{prob.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-[9px] font-black border rounded-sm ${getDifficultyColor(prob.difficulty)}`}>
                      {prob.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-[10px] text-muted tabular-nums">
                    {prob.timeLimit}s / {prob.memoryLimit}MB
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => onEdit(prob)} className="h-10 w-10 border-2 border-gray-200 flex items-center justify-center text-muted hover:text-primary-1 hover:border-primary-1/40 rounded-md transition-all cursor-pointer">
                        <FaEdit size={14} />
                      </button>
                      <button onClick={() => onDelete(prob.problemId, prob.title)} className="h-10 w-10 border-2 border-gray-200 flex items-center justify-center text-muted hover:text-red-500 hover:border-red-200 rounded-md transition-all cursor-pointer">
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

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-2 border-gray-200 p-4 rounded-md shadow-sm">
        <p className="text-[10px] font-black text-muted uppercase tracking-widest">
           Page {currentPage} of {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1 || isLoading} 
            onClick={() => setCurrentPage(currentPage - 1)} 
            className="h-12 w-12 border-2 border-gray-200 flex items-center justify-center rounded-md hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all"
          >
            <FaChevronLeft size={14} />
          </button>
          
          <div className="flex items-center px-6 h-12 border-2 border-gray-200 rounded-md text-[10px] font-black text-darkest uppercase tracking-widest bg-gray-50/50 tabular-nums">
            {currentPage} / {totalPages || 1}
          </div>
          
          <button 
            disabled={currentPage >= totalPages || isLoading} 
            onClick={() => setCurrentPage(currentPage + 1)} 
            className="h-12 w-12 border-2 border-gray-200 flex items-center justify-center rounded-md hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-all"
          >
            <FaChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}