import { FiSearch, FiLoader, FiCheck, FiLock, FiUnlock } from "react-icons/fi";

interface RepoListStepProps {
  repos: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedRepo: string | null;
  onSelect: (repoFullName: string) => void;
}

export const RepoListStep = ({
  repos, loading, searchTerm, setSearchTerm, selectedRepo, onSelect,
}: RepoListStepProps) => {
  const filtered = repos.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-5 gap-4">
      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
        <input
          type="text"
          placeholder="Filter repositories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border-2 border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <FiLoader className="animate-spin text-slate-300" size={24} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No repositories found</p>
          </div>
        ) : (
          filtered.map((repo) => {
            const selected = selectedRepo === repo.full_name;
            return (
              <button
                key={repo.id}
                onClick={() => onSelect(repo.full_name)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-sm border-2 transition-all text-left ${
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-100 bg-white hover:border-slate-300 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {repo.private
                    ? <FiLock size={12} className={selected ? "text-slate-400 shrink-0" : "text-slate-300 shrink-0"} />
                    : <FiUnlock size={12} className={selected ? "text-slate-400 shrink-0" : "text-slate-300 shrink-0"} />}
                  <div className="min-w-0">
                    <p className={`text-sm font-black truncate ${selected ? "text-white" : "text-slate-900"}`}>
                      {repo.name}
                    </p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider ${selected ? "text-slate-400" : "text-slate-400"}`}>
                      {repo.full_name}
                    </p>
                  </div>
                </div>
                {selected && <FiCheck size={14} className="text-primary-1 shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
