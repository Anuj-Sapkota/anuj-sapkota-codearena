import {
  FiHome, FiFolderPlus, FiX, FiLoader,
  FiFolder, FiFile, FiChevronRight,
} from "react-icons/fi";

interface FileExplorerStepProps {
  currentPath: string;
  contents: any[];
  isFetching: boolean;
  loadDirectory: (path: string) => void;
  isCreatingFolder: boolean;
  setIsCreatingFolder: (val: boolean) => void;
  newFolderName: string;
  setNewFolderName: (val: string) => void;
  handleCreateFolder: () => void;
  isFolderLoading: boolean;
  fileName: string;
  setFileName: (val: string) => void;
  commitMsg: string;
  setCommitMsg: (val: string) => void;
}

const fieldClass = "w-full border-2 border-slate-200 rounded-sm px-3 py-2 text-sm font-medium text-slate-900 bg-white outline-none focus:border-slate-900 transition-colors";
const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5";

export const FileExplorerStep = ({
  currentPath, contents, isFetching, loadDirectory,
  isCreatingFolder, setIsCreatingFolder, newFolderName, setNewFolderName,
  handleCreateFolder, isFolderLoading, fileName, setFileName, commitMsg, setCommitMsg,
}: FileExplorerStepProps) => {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="flex flex-col flex-1 overflow-hidden p-5 gap-4">
      {/* Breadcrumb + new folder */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-0 bg-slate-50 border-2 border-slate-100 rounded-sm px-3 py-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => loadDirectory("")}
            className="text-slate-400 hover:text-slate-900 transition-colors shrink-0"
          >
            <FiHome size={13} />
          </button>
          {pathParts.map((part, i) => (
            <div key={i} className="flex items-center gap-1.5 shrink-0">
              <FiChevronRight size={10} className="text-slate-300" />
              <button
                onClick={() => loadDirectory(pathParts.slice(0, i + 1).join("/"))}
                className="text-[10px] font-black text-slate-600 hover:text-slate-900 uppercase tracking-wider whitespace-nowrap transition-colors"
              >
                {part}
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => setIsCreatingFolder(!isCreatingFolder)}
          className={`w-9 h-9 flex items-center justify-center rounded-sm border-2 transition-all shrink-0 ${
            isCreatingFolder
              ? "border-rose-200 text-rose-500 hover:bg-rose-50"
              : "border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900"
          }`}
        >
          {isCreatingFolder ? <FiX size={13} /> : <FiFolderPlus size={13} />}
        </button>
      </div>

      {/* New folder input */}
      {isCreatingFolder && (
        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
          <input
            autoFocus
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            className={fieldClass + " flex-1"}
          />
          <button
            disabled={isFolderLoading || !newFolderName.trim()}
            onClick={handleCreateFolder}
            className="flex items-center gap-1.5 bg-slate-900 text-white px-4 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 shrink-0"
          >
            {isFolderLoading ? <FiLoader size={12} className="animate-spin" /> : "Create"}
          </button>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 bg-white border-2 border-slate-100 rounded-sm overflow-y-auto">
        {isFetching ? (
          <div className="flex items-center justify-center py-12">
            <FiLoader className="animate-spin text-slate-300" size={22} />
          </div>
        ) : contents.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Empty directory</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {contents.map((item, idx) => (
              <div
                key={idx}
                onDoubleClick={() => item.type === "dir" && loadDirectory(item.path)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group cursor-default"
              >
                {item.type === "dir"
                  ? <FiFolder size={14} className="text-amber-400 shrink-0" />
                  : <FiFile size={14} className="text-slate-300 shrink-0" />}
                <span className="text-sm font-medium text-slate-700 flex-1 truncate select-none">
                  {item.name}
                </span>
                {item.type === "dir" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); loadDirectory(item.path); }}
                    className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 transition-all"
                  >
                    <FiChevronRight size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File name + commit message */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>File Name</label>
          <input value={fileName} onChange={(e) => setFileName(e.target.value)} className={fieldClass} placeholder="solution.js" />
        </div>
        <div>
          <label className={labelClass}>Commit Message</label>
          <input value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} className={fieldClass} placeholder="Solved on CodeArena" />
        </div>
      </div>
    </div>
  );
};
