import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FiLoader, FiChevronLeft, FiArrowRight } from "react-icons/fi";
import { toast } from "sonner";
import { FileExplorerStep } from "../FileExplorerStep";
import { RepoListStep } from "../RepoListStep";
import { ModalHeader } from "../ModalHeader";
import { PushSuccessView } from "../PushSuccessView";
import { GithubContent, GithubRepo } from "@/types/github.types";
import { githubService } from "@/lib/services/github.service";

const LANG_EXT: Record<number, string> = { 63: "js", 71: "py", 54: "cpp", 62: "java" };

// Step indicator dots
function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2].map((s) => (
        <div
          key={s}
          className={`rounded-full transition-all duration-300 ${
            step === s ? "w-4 h-1.5 bg-slate-900" : "w-1.5 h-1.5 bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

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
      toast.error("Push failed — check your GitHub token permissions");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">

        <ModalHeader step={step} path={currentPath} onClose={handleClose} />

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-[#f8fafc]">
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

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => (step === 2 ? setStep(1) : handleClose())}
              className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
            >
              {step === 2 && <FiChevronLeft size={11} />}
              {step === 2 ? "Back" : "Cancel"}
            </button>
            <StepDots step={step} />
          </div>

          <button
            disabled={!selectedRepo || isPushing || !selectedSubmission}
            onClick={step === 1
              ? () => { setStep(2); loadDirectory(""); }
              : handlePush}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            {isPushing
              ? <><FiLoader size={12} className="animate-spin" /> Pushing...</>
              : step === 1
                ? <><FiArrowRight size={12} /> Select Location</>
                : <><FiArrowRight size={12} /> Push to GitHub</>}
          </button>
        </div>
      </div>
    </div>
  );
};
