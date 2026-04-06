import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FaSpinner, FaChevronLeft } from "react-icons/fa";
import { toast } from "sonner";
import { FileExplorerStep } from "../FileExplorerStep";
import { RepoListStep } from "../RepoListStep";
import { ModalHeader } from "../ModalHeader";
import { PushSuccessView } from "../PushSuccessView";
import { GithubContent, GithubRepo } from "@/types/github.types";
import { githubService } from "@/lib/services/github.service";

const LANG_EXT: Record<number, string> = { 63: "js", 71: "py", 54: "cpp", 62: "java" };

export const GithubRepoModal = ({
  isOpen,
  onClose,
  problemTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  problemTitle?: string;
}) => {
  const { selectedSubmission } = useSelector((state: RootState) => state.workspace);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [contents, setContents] = useState<GithubContent[]>([]);
  const [isFetchingContents, setIsFetchingContents] = useState(false);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderLoading, setIsFolderLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [commitMsg, setCommitMsg] = useState("");
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccessUrl, setPushSuccessUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingRepos(true);
    githubService.fetchRepos()
      .then(setRepos)
      .catch(() => toast.error("Failed to load repositories"))
      .finally(() => setLoadingRepos(false));
  }, [isOpen]);

  useEffect(() => {
    if (problemTitle && selectedSubmission) {
      const ext = LANG_EXT[selectedSubmission.languageId] || "txt";
      setFileName(`solution.${ext}`);
      setCommitMsg(`Solved ${problemTitle} on CodeArena`);
    }
  }, [problemTitle, selectedSubmission]);

  const loadDirectory = async (path: string) => {
    if (!selectedRepo) return;
    const [owner, repo] = selectedRepo.split("/");
    setIsFetchingContents(true);
    try {
      const data = await githubService.fetchRepoContents(owner, repo, path);
      setContents(data);
      setCurrentPath(path);
    } catch {
      toast.error("Failed to load directory");
    } finally {
      setIsFetchingContents(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedRepo) return;
    const [owner, repo] = selectedRepo.split("/");
    setIsFolderLoading(true);
    try {
      await githubService.createFolder(owner, repo, currentPath, newFolderName.trim());
      toast.success("Folder created");
      setNewFolderName("");
      setIsCreatingFolder(false);
      loadDirectory(currentPath);
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setIsFolderLoading(false);
    }
  };

  const handlePush = async () => {
    if (!selectedRepo || !fileName || !selectedSubmission) return;
    setIsPushing(true);
    try {
      const fullPath = currentPath ? `${currentPath}/${fileName}` : fileName;
      const result = await githubService.pushCode(
        selectedRepo,
        selectedSubmission.code,
        fullPath,
        commitMsg,
      );
      setPushSuccessUrl(result.url);
    } catch {
      toast.error("Push failed");
    } finally {
      setIsPushing(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setPushSuccessUrl(null);
    setSelectedRepo(null);
    setCurrentPath("");
    onClose();
  };

  if (!isOpen) return null;
  if (pushSuccessUrl) return <PushSuccessView url={pushSuccessUrl} onClose={handleClose} />;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <ModalHeader step={step} path={currentPath} onClose={handleClose} />

        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          {step === 1 ? (
            <RepoListStep
              repos={repos}
              loading={loadingRepos}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedRepo={selectedRepo}
              onSelect={(val) => setSelectedRepo(selectedRepo === val ? null : val)}
            />
          ) : (
            <FileExplorerStep
              currentPath={currentPath}
              contents={contents}
              isFetching={isFetchingContents}
              loadDirectory={loadDirectory}
              isCreatingFolder={isCreatingFolder}
              setIsCreatingFolder={setIsCreatingFolder}
              newFolderName={newFolderName}
              setNewFolderName={setNewFolderName}
              handleCreateFolder={handleCreateFolder}
              isFolderLoading={isFolderLoading}
              fileName={fileName}
              setFileName={setFileName}
              commitMsg={commitMsg}
              setCommitMsg={setCommitMsg}
            />
          )}
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-between">
          <button
            onClick={() => (step === 2 ? setStep(1) : handleClose())}
            className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 flex items-center gap-2 transition-colors"
          >
            {step === 2 && <FaChevronLeft />}
            {step === 2 ? "Go_Back" : "Cancel"}
          </button>
          <button
            disabled={!selectedRepo || isPushing || !selectedSubmission}
            onClick={step === 1 ? () => { setStep(2); loadDirectory(""); } : handlePush}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-emerald-600 disabled:bg-slate-200 transition-all flex items-center gap-2 shadow-xl"
          >
            {isPushing ? <FaSpinner className="animate-spin" /> : step === 1 ? "Next_Phase" : "Execute_Push"}
          </button>
        </div>
      </div>
    </div>
  );
};
