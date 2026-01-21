import { FaPlus, FaSearch, FaSlidersH } from "react-icons/fa";

interface Props {
  search: string;
  setSearch: (s: string) => void;
  onOpenModal: () => void;
  onOpenFilter: () => void;
  hasActiveFilters: boolean;
}

export default function ProblemControls({ search, setSearch, onOpenModal, onOpenFilter, hasActiveFilters }: Props) {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-darkest tracking-tight uppercase">Challenge Registry.</h1>
          <p className="text-muted text-sm font-medium mt-1 uppercase tracking-widest">Problem & Test-Case Architecture</p>
        </div>
        <button onClick={onOpenModal} className="bg-primary-1 hover:bg-primary-2 text-white px-8 py-3 rounded-md font-black uppercase text-xs tracking-widest border border-primary-2 transition-all active:scale-95 shadow-lg shadow-primary-1/10 flex items-center justify-center">
          <FaPlus size={12} className="mr-2" /> New Problem
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-gray-200 rounded-md py-3 pl-11 pr-4 text-xs font-black uppercase tracking-widest outline-none focus:border-primary-1/40 transition-all"
          />
        </div>
        <button
          onClick={onOpenFilter}
          className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 px-6 py-3 rounded-md cursor-pointer hover:bg-gray-50 transition-colors group"
        >
          <FaSlidersH className="text-muted group-hover:text-primary-1" size={14} />
          <span className="text-xs font-black text-muted uppercase tracking-widest">Filters</span>
          {hasActiveFilters && <span className="h-2 w-2 bg-primary-1 rounded-full animate-pulse shadow-[0_0_8px_rgba(46,200,102,1)]" />}
        </button>
      </div>
    </div>
  );
}