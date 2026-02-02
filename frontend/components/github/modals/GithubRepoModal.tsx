import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  fetchGithubReposThunk,
  pushToGithubThunk,
  fetchRepoContentsThunk,
  createGithubFolderThunk,
} from "@/lib/store/features/github/github.actions";
import {
  FaGithub,
  FaSearch,
  FaSpinner,
  FaCheckCircle,
  FaFolder,
  FaFileCode,
  FaChevronLeft,
  FaChevronRight,
  FaRocket,
  FaHome,
  FaFolderPlus,
  FaTimes,
} from "react-icons/fa";
import { toast } from "sonner";

export const GithubRepoModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { selectedSubmission } = useSelector(
    (state: RootState) => state.workspace,
  );
  const { currentProblem } = useSelector((state: RootState) => state.problem);

  // --- STEP & SELECTION STATE ---
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [contents, setContents] = useState<any[]>([]);
  const [isFetchingContents, setIsFetchingContents] = useState(false);

  // --- REPO LIST STATE ---
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- FOLDER CREATION STATE ---
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderLoading, setIsFolderLoading] = useState(false);

  // --- FINAL PUSH STATE ---
  const [fileName, setFileName] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);

  // Initial Fetch
  useEffect(() => {
    if (isOpen) {
      setLoadingRepos(true);
      dispatch(fetchGithubReposThunk())
        .unwrap()
        .then(setRepos)
        .finally(() => setLoadingRepos(false));
    }
  }, [isOpen, dispatch]);

  // Defaults for File/Commit
  useEffect(() => {
    if (currentProblem && selectedSubmission) {
      const langMap: Record<number, string> = {
        63: "js",
        71: "py",
        54: "cpp",
        62: "java",
        74: "ts",
      };
      const ext = langMap[selectedSubmission.languageId] || "txt";
      setFileName(`solution.${ext}`);
      setCommitMsg(`Solved ${currentProblem.title} on CodeArena`);
    }
  }, [currentProblem, selectedSubmission]);

  // --- HANDLERS ---
  const loadDirectory = async (path: string) => {
    if (!selectedRepo) return;
    const [owner, repo] = selectedRepo.split("/");

    setIsFetchingContents(true);
    try {
      const data = await dispatch(
        fetchRepoContentsThunk({ owner, repo, path }),
      ).unwrap();
      setContents(data);
      setCurrentPath(path);
    } catch (err: any) {
      toast.error(err || "Failed to load directory");
    } finally {
      setIsFetchingContents(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedRepo) return;
    const [owner, repo] = selectedRepo.split("/");

    setIsFolderLoading(true);
    try {
      await dispatch(
        createGithubFolderThunk({
          owner,
          repo,
          path: currentPath,
          folderName: newFolderName.trim(),
        }),
      ).unwrap();

      toast.success("Folder created successfully");
      setNewFolderName("");
      setIsCreatingFolder(false);
      loadDirectory(currentPath); // Refresh
    } catch (err: any) {
      toast.error(err || "Failed to create folder");
    } finally {
      setIsFolderLoading(false);
    }
  };

  const handlePush = async () => {
    if (!selectedRepo || !fileName) return;
    setIsPushing(true);
    try {
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
      const result = await dispatch(
        pushToGithubThunk({
          repoFullName: selectedRepo,
          code: selectedSubmission.code,
          path: fullPath,
          commitMessage: commitMsg,
        }),
      ).unwrap();
      setPushSuccessUrl(result.url);
    } catch (err: any) {
      toast.error(err || "Push failed");
    } finally {
      setIsPushing(false);
    }
  };

  if (!isOpen) return null;

  if (pushSuccessUrl) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
        <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <FaRocket size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
            Push_Success
          </h2>
          <p className="text-slate-500 text-sm mt-2 mb-8">
            Solution successfully deployed to GitHub.
          </p>
          <a
            href={pushSuccessUrl}
            target="_blank"
            className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-600 transition-all"
          >
            View on GitHub
          </a>
          <button
            onClick={onClose}
            className="mt-4 text-slate-400 font-bold text-[10px] tracking-widest uppercase"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl">
              <FaGithub size={24} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest">
                {step === 1 ? "Select_Repository" : "Navigate_Directories"}
              </h3>
              <p className="text-[10px] text-emerald-100 font-medium">
                {step === 1
                  ? "Choose your destination repo"
                  : `Path: /${currentPath}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          {step === 1 ? (
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              <div className="relative mb-4">
                <FaSearch
                  className="absolute left-4 top-4 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Filter repositories..."
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-emerald-500 outline-none transition-all shadow-sm"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {loadingRepos ? (
                  <div className="flex justify-center py-20">
                    <FaSpinner
                      className="animate-spin text-emerald-600"
                      size={32}
                    />
                  </div>
                ) : (
                  repos
                    .filter((r) =>
                      r.name.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((repo) => (
                      <button
                        key={repo.id}
                        onClick={() =>
                          setSelectedRepo(
                            selectedRepo === repo.full_name
                              ? null
                              : repo.full_name,
                          )
                        }
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedRepo === repo.full_name ? "bg-white border-emerald-500 shadow-lg ring-1 ring-emerald-500" : "bg-white border-slate-100 hover:border-slate-300"}`}
                      >
                        <div className="text-left">
                          <p className="font-black text-sm text-slate-800">
                            {repo.name}
                          </p>
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {repo.private ? "Private" : "Public"}
                          </span>
                        </div>
                        {selectedRepo === repo.full_name && (
                          <FaCheckCircle
                            className="text-emerald-500"
                            size={20}
                          />
                        )}
                      </button>
                    ))
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              {/* Breadcrumbs + Folder Creator */}
              <div className="flex items-center justify-between mb-4 bg-slate-100 p-2 px-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => loadDirectory("")}
                    className="p-2 hover:bg-white rounded-lg text-emerald-600"
                  >
                    <FaHome />
                  </button>
                  <span className="text-slate-300">/</span>
                  {currentPath
                    .split("/")
                    .filter(Boolean)
                    .map((part, i, arr) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <button
                          onClick={() =>
                            loadDirectory(arr.slice(0, i + 1).join("/"))
                          }
                          className="text-[10px] font-black uppercase text-slate-600 hover:text-emerald-600"
                        >
                          {part}
                        </button>
                        {i !== arr.length - 1 && (
                          <span className="text-slate-300">/</span>
                        )}
                      </div>
                    ))}
                </div>
                <button
                  onClick={() => setIsCreatingFolder(!isCreatingFolder)}
                  className={`p-2.5 rounded-xl transition-all ${isCreatingFolder ? "bg-red-500 text-white" : "bg-white text-emerald-600 border border-emerald-100"}`}
                >
                  {isCreatingFolder ? (
                    <FaTimes size={14} />
                  ) : (
                    <FaFolderPlus size={18} />
                  )}
                </button>
              </div>

              {isCreatingFolder && (
                <div className="mb-4 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                  <input
                    autoFocus
                    placeholder="New folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                    className="flex-1 bg-white border-2 border-emerald-500 rounded-xl px-4 py-2 text-xs font-bold outline-none"
                  />
                  <button
                    disabled={isFolderLoading}
                    onClick={handleCreateFolder}
                    className="bg-emerald-600 text-white px-5 rounded-xl text-[10px] font-black uppercase min-w-[80px]"
                  >
                    {isFolderLoading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              )}

              {/* Explorer */}
              <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-y-auto custom-scrollbar">
                {isFetchingContents ? (
                  <div className="flex justify-center py-20">
                    <FaSpinner
                      className="animate-spin text-emerald-600"
                      size={32}
                    />
                  </div>
                ) : (
                  contents.map((item, idx) => (
                    <div
                      key={idx}
                      onDoubleClick={() =>
                        item.type === "dir" && loadDirectory(item.path)
                      }
                      className="flex items-center gap-4 p-3 px-5 border-b border-slate-50 hover:bg-emerald-50/30 transition-colors group cursor-default"
                    >
                      <div className="shrink-0 group-hover:scale-110 transition-transform duration-200">
                        {item.type === "dir" ? (
                          <FaFolder className="text-amber-400" size={18} />
                        ) : (
                          <FaFileCode className="text-slate-300" size={18} />
                        )}
                      </div>
                      <span
                        className={`text-[13px] font-semibold select-none flex-1 truncate ${item.type === "dir" ? "text-slate-700" : "text-slate-400"}`}
                      >
                        {item.name}
                      </span>
                      {item.type === "dir" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadDirectory(item.path);
                          }}
                          className="p-2 -mr-2 rounded-lg hover:bg-emerald-100 text-slate-300 hover:text-emerald-600 transition-all group/arrow"
                        >
                          <FaChevronRight
                            className="group-hover/arrow:translate-x-0.5 transition-transform"
                            size={12}
                          />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Config Panel */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    File_Name
                  </label>
                  <input
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Commit_Msg
                  </label>
                  <input
                    value={commitMsg}
                    onChange={(e) => setCommitMsg(e.target.value)}
                    className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-between">
          <button
            onClick={() => (step === 2 ? setStep(1) : onClose())}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            {step === 2 && <FaChevronLeft />}{" "}
            {step === 2 ? "Go_Back" : "Cancel"}
          </button>
          <button
            disabled={!selectedRepo || isPushing}
            onClick={
              step === 1
                ? () => {
                    setStep(2);
                    loadDirectory("");
                  }
                : handlePush
            }
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-600 disabled:bg-slate-200 transition-all flex items-center gap-2 shadow-xl active:scale-95"
          >
            {isPushing ? (
              <FaSpinner className="animate-spin" />
            ) : step === 1 ? (
              "Next_Phase"
            ) : (
              "Execute_Push"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
