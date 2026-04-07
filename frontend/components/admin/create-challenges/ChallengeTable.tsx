"use client";

import { FiEdit3, FiTrash2, FiLoader, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { LuSwords } from "react-icons/lu";
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

const DIFF: Record<string, string> = {
  EASY:   "text-emerald-600 bg-emerald-50 border-emerald-100",
  MEDIUM: "text-amber-600   bg-amber-50   border-amber-100",
  HARD:   "text-rose-600    bg-rose-50    border-rose-100",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ChallengeTable({ items, isLoading, currentPage, setCurrentPage, onEdit, onDelete, totalPages }: Props) {
  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white border-2 border-slate-100 rounded-sm">
        <FiLoader className="animate-spin text-slate-300" size={28} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">Loading</p>
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-white border-2 border-dashed border-slate-200 rounded-sm">
        <LuSwords size={28} className="text-slate-200 mb-2" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No challenges found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-100 bg-slate-50/60">
                {["Challenge", "Difficulty", "Schedule", "Problems", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ${i === 5 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((c) => (
                <tr key={c.challengeId} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Title */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                      <div>
                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{c.title}</p>
                        <p className="text-[10px] text-primary-1 font-bold mt-0.5">/{c.slug}</p>
                      </div>
                    </div>
                  </td>

                  {/* Difficulty */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[9px] font-black border rounded-sm uppercase tracking-wider ${DIFF[c.difficulty] ?? "text-slate-500 bg-slate-50 border-slate-100"}`}>
                      {c.difficulty}
                    </span>
                  </td>

                  {/* Schedule */}
                  <td className="px-5 py-4">
                    <p className="text-[10px] font-mono text-slate-500">{formatDate(c.startTime)}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">→ {formatDate(c.endTime)}</p>
                  </td>

                  {/* Problems count */}
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-black text-slate-700 tabular-nums">
                      {c.problems?.length ?? c._count?.problems ?? 0}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[9px] font-black border rounded-sm uppercase tracking-wider ${
                      c.isPublic
                        ? "text-emerald-600 bg-emerald-50 border-emerald-100"
                        : "text-amber-600 bg-amber-50 border-amber-100"
                    }`}>
                      {c.isPublic ? "Live" : "Draft"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEdit(c)}
                        className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-primary-1 hover:border-primary-1/40 transition-all"
                      >
                        <FiEdit3 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(c.challengeId, c.title)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white border-2 border-slate-100 rounded-sm px-5 py-3">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
          Page {currentPage} of {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1 || isLoading}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 transition-all"
          >
            <FiChevronLeft size={13} />
          </button>
          <span className="text-[10px] font-black text-slate-900 px-3 py-1.5 border-2 border-slate-100 rounded-sm bg-slate-50 tabular-nums">
            {currentPage} / {totalPages || 1}
          </span>
          <button
            disabled={currentPage >= totalPages || isLoading}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="w-8 h-8 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-500 hover:border-slate-900 hover:text-slate-900 disabled:opacity-30 transition-all"
          >
            <FiChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
