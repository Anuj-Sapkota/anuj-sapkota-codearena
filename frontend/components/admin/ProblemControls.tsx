import { FiPlus, FiSearch, FiSliders } from "react-icons/fi";

interface Props {
  search: string;
  setSearch: (s: string) => void;
  onOpenModal: () => void;
  onOpenFilter: () => void;
  hasActiveFilters: boolean;
}

export default function ProblemControls({ search, setSearch, onOpenModal, onOpenFilter, hasActiveFilters }: Props) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Problems<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Problem & test-case management
          </p>
        </div>
        <button
          onClick={onOpenModal}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all active:scale-95 shrink-0"
        >
          <FiPlus size={13} /> New Problem
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors"
          />
        </div>
        <button
          onClick={onOpenFilter}
          className="flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2.5 rounded-sm hover:border-slate-900 transition-colors group shrink-0"
        >
          <FiSliders size={13} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
            Filters
          </span>
          {hasActiveFilters && <span className="w-1.5 h-1.5 bg-primary-1 rounded-full" />}
        </button>
      </div>
    </div>
  );
}
