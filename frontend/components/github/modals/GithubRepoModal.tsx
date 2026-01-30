// src/components/modals/GithubRepoModal.tsx
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import { fetchGithubReposThunk } from "@/lib/store/features/github/github.actions";
import { FaGithub, FaSearch, FaSpinner } from "react-icons/fa";

export const GithubRepoModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");

  // You'll need to create a small githubSlice or use local state for the list
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use a local variable to prevent state updates if component unmounts
    let isMounted = true;

    const getRepos = async () => {
      if (!isOpen) return;

      // By putting this in an async wrapper, we move it out of the
      // synchronous execution path of the effect body
      setLoading(true);

      try {
        const data = await dispatch(fetchGithubReposThunk()).unwrap();
        if (isMounted) {
          setRepos(data);
        }
      } catch (err) {
        console.error("Failed to fetch repos:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getRepos();

    return () => {
      isMounted = false;
    };
  }, [isOpen, dispatch]);
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e1e] border border-zinc-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-zinc-800/50">
          <div className="flex items-center gap-2 text-white font-bold">
            <FaGithub size={20} />
            <span>Select Repository</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <FaSearch className="absolute left-3 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search your repositories..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center py-10 gap-3 text-zinc-500">
                <FaSpinner className="animate-spin" size={24} />
                <p className="text-sm">Fetching from GitHub...</p>
              </div>
            ) : filteredRepos.length > 0 ? (
              filteredRepos.map((repo) => (
                <button
                  key={repo.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/50 border border-transparent transition-all mb-2 group"
                >
                  <p className="text-white font-medium group-hover:text-emerald-400">
                    {repo.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {repo.private ? "🔒 Private" : "🌐 Public"}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-center py-10 text-zinc-500">
                No repositories found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
