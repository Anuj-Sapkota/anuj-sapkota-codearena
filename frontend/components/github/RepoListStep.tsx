import { FaSearch, FaSpinner, FaCheckCircle } from "react-icons/fa";

interface RepoListStepProps {
  repos: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedRepo: string | null;
  onSelect: (repoFullName: string) => void;
}

export const RepoListStep = ({ repos, loading, searchTerm, setSearchTerm, selectedRepo, onSelect }: RepoListStepProps) => (
  <div className="p-6 flex-1 flex flex-col overflow-hidden">
    <div className="relative mb-4">
      <FaSearch className="absolute left-4 top-4 text-slate-400" size={14} />
      <input
        type="text"
        placeholder="Filter repositories..."
        value={searchTerm}
        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-emerald-500 outline-none transition-all shadow-sm"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
      {loading ? (
        <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-emerald-600" size={32} /></div>
      ) : (
        repos.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase())).map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelect(repo.full_name)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
              selectedRepo === repo.full_name ? "bg-white border-emerald-500 shadow-lg ring-1 ring-emerald-500" : "bg-white border-slate-100 hover:border-slate-300"
            }`}
          >
            <div className="text-left">
              <p className="font-black text-sm text-slate-800">{repo.name}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{repo.private ? "Private" : "Public"}</span>
            </div>
            {selectedRepo === repo.full_name && <FaCheckCircle className="text-emerald-500" size={20} />}
          </button>
        ))
      )}
    </div>
  </div>
);