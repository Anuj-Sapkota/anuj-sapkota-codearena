// src/components/modals/GithubRepoModal.tsx
import { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import { fetchGithubReposThunk } from "@/lib/store/features/github/github.actions";
import {
  FaGithub,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaFilter,
  FaSortAmountDown,
} from "react-icons/fa";

export const GithubRepoModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRepoName, setSelectedRepoName] = useState<string | null>(null);

  const [privacyFilter, setPrivacyFilter] = useState<
    "all" | "public" | "private"
  >("all");
  const [sortBy, setSortBy] = useState<"updated" | "name">("updated");

  useEffect(() => {
    let isMounted = true;
    const getRepos = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const data = await dispatch(fetchGithubReposThunk()).unwrap();
        if (data && data.length > 0) {
          console.log("--- RAW REPO DATA FROM BACKEND ---");
          console.log("First Repo:", data[0]);
          console.log("Date field (updated_at):", data[0].updated_at);
          console.log("Date field (pushed_at):", data[0].pushed_at);
          console.log("----------------------------------");
        }
        if (isMounted) setRepos(data);
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    getRepos();
    return () => {
      isMounted = false;
    };
  }, [isOpen, dispatch]);

  const processedRepos = useMemo(() => {
    const filtered = repos.filter((repo) => {
      const matchesSearch = repo.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPrivacy =
        privacyFilter === "all"
          ? true
          : privacyFilter === "public"
            ? !repo.private
            : repo.private;
      return matchesSearch && matchesPrivacy;
    });

    return filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  }, [repos, searchTerm, privacyFilter, sortBy]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-300 w-full max-w-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header - Deep Vibrant Emerald */}
        <div className="p-6 border-b border-emerald-700 flex justify-between items-center bg-emerald-600 shadow-inner">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/30 shadow-sm">
              <FaGithub size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-widest uppercase">
                Select_Repository
              </span>
              <span className="text-[10px] font-medium text-emerald-100/80">
                Connect your code to GitHub
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            ✕
          </button>
        </div>

        {/* Filters Area - Deepened Slates */}
        <div className="p-5 bg-slate-100 border-b border-slate-200 space-y-4">
          <div className="relative group">
            <FaSearch
              className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-emerald-600 transition-colors"
              size={14}
            />
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            {/* Privacy Filter */}
            <div className="flex-1 flex items-center bg-white border-2 border-slate-200 rounded-xl px-3 focus-within:border-emerald-500 transition-all shadow-sm">
              <FaFilter size={10} className="text-emerald-600 mr-2" />
              <select
                className="bg-transparent text-slate-700 text-[11px] font-black py-2.5 w-full outline-none cursor-pointer uppercase tracking-tighter"
                value={privacyFilter}
                onChange={(e) => setPrivacyFilter(e.target.value as any)}
              >
                <option value="all">ALL_VISIBILITY</option>
                <option value="public">PUBLIC_REPOS</option>
                <option value="private">PRIVATE_REPOS</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex-1 flex items-center bg-white border-2 border-slate-200 rounded-xl px-3 focus-within:border-emerald-500 transition-all shadow-sm">
              <FaSortAmountDown size={10} className="text-emerald-600 mr-2" />
              <select
                className="bg-transparent text-slate-700 text-[11px] font-black py-2.5 w-full outline-none cursor-pointer uppercase tracking-tighter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="updated">LATEST_ACTIVITY</option>
                <option value="name">ALPHABETICAL</option>
              </select>
            </div>
          </div>
        </div>

        {/* Repository List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 min-h-[300px] custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <FaSpinner className="animate-spin text-emerald-600" size={36} />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Synchronizing_Repos...
              </p>
            </div>
          ) : processedRepos.length > 0 ? (
            processedRepos.map((repo) => {
              const isSelected = selectedRepoName === repo.full_name;
              return (
                <button
                  key={repo.id}
                  onClick={() => {
                    // TOGGLE LOGIC:
                    setSelectedRepoName(isSelected ? null : repo.full_name);
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                    isSelected
                      ? "bg-white border-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500"
                      : "bg-white border-slate-200 hover:border-slate-400 hover:shadow-md"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`text-sm font-black tracking-tight truncate ${isSelected ? "text-emerald-700" : "text-slate-800"}`}
                    >
                      {repo.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest border ${
                          repo.private
                            ? "bg-slate-800 text-white border-slate-800"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {repo.private ? "Private" : "Public"}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        Updated {formatDate(repo.updated_at)}
                      </span>
                    </div>
                  </div>

                  {/* Checkbox Area */}
                  <div className="relative flex items-center justify-center">
                    {/* If selected, show Checkmark; if hovered while selected, show a "minus" or just fade it to imply unselecting */}
                    <div
                      className={`transition-all duration-300 ${isSelected ? "scale-110 opacity-100" : "scale-75 opacity-0 group-hover:opacity-20"}`}
                    >
                      <FaCheckCircle className="text-emerald-600" size={24} />
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FaGithub className="text-slate-200 mb-4" size={48} />
              <p className="text-xs font-bold uppercase tracking-widest">
                No matching results
              </p>
            </div>
          )}
        </div>

        {/* Footer - Solid & Deep */}
        <div className="p-5 border-t border-slate-200 bg-white flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-[10px] font-black text-slate-500 hover:text-red-500 tracking-[0.2em] transition-colors uppercase"
          >
            Abort_Action
          </button>

          <button
            disabled={!selectedRepoName}
            className="group relative px-10 py-3.5 bg-slate-900 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl active:scale-95"
            onClick={() => alert(`Confirmed: ${selectedRepoName}`)}
          >
            <span className="relative z-10">Confirm_Target</span>
            {!selectedRepoName && (
              <div className="absolute inset-0 bg-slate-300 rounded-xl" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
