import { FaHome, FaFolderPlus, FaTimes, FaSpinner, FaFolder, FaFileCode, FaChevronRight } from "react-icons/fa";

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

export const FileExplorerStep = ({ 
  currentPath, contents, isFetching, loadDirectory, isCreatingFolder, 
  setIsCreatingFolder, newFolderName, setNewFolderName, handleCreateFolder, 
  isFolderLoading, fileName, setFileName, commitMsg, setCommitMsg 
}: FileExplorerStepProps) => {
  const pathParts = currentPath.split("/").filter(Boolean);

  return (
    <div className="p-6 flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between mb-4 bg-slate-100 p-2 px-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button onClick={() => loadDirectory("")} className="p-2 hover:bg-white rounded-lg text-emerald-600"><FaHome /></button>
          <span className="text-slate-300">/</span>
          {pathParts.map((part, i) => (
            <div key={i} className="flex items-center gap-2 whitespace-nowrap">
              <button onClick={() => loadDirectory(pathParts.slice(0, i + 1).join("/"))} className="text-[10px] font-black uppercase text-slate-600 hover:text-emerald-600">{part}</button>
              {i !== pathParts.length - 1 && <span className="text-slate-300">/</span>}
            </div>
          ))}
        </div>
        <button onClick={() => setIsCreatingFolder(!isCreatingFolder)} className={`p-2.5 rounded-xl transition-all ${isCreatingFolder ? "bg-red-500 text-white" : "bg-white text-emerald-600 border border-emerald-100"}`}>
          {isCreatingFolder ? <FaTimes size={14} /> : <FaFolderPlus size={18} />}
        </button>
      </div>

      {/* New Folder Input */}
      {isCreatingFolder && (
        <div className="mb-4 flex gap-2 animate-in slide-in-from-top-2 duration-200">
          <input autoFocus placeholder="New folder name..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()} className="flex-1 bg-white border-2 border-emerald-500 rounded-xl px-4 py-2 text-xs font-bold outline-none" />
          <button disabled={isFolderLoading} onClick={handleCreateFolder} className="bg-emerald-600 text-white px-5 rounded-xl text-[10px] font-black uppercase min-w-[80px]">
            {isFolderLoading ? <FaSpinner className="animate-spin" /> : "Create"}
          </button>
        </div>
      )}

      {/* List */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 overflow-y-auto custom-scrollbar">
        {isFetching ? (
          <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-emerald-600" size={32} /></div>
        ) : (
          contents.map((item, idx) => (
            <div key={idx} onDoubleClick={() => item.type === "dir" && loadDirectory(item.path)} className="flex items-center gap-4 p-3 px-5 border-b border-slate-50 hover:bg-emerald-50/30 transition-colors group cursor-default">
              <div className="shrink-0 group-hover:scale-110 transition-transform duration-200">
                {item.type === "dir" ? <FaFolder className="text-amber-400" size={18} /> : <FaFileCode className="text-slate-300" size={18} />}
              </div>
              <span className="text-[13px] font-semibold select-none flex-1 truncate text-slate-700">{item.name}</span>
              {item.type === "dir" && (
                <button onClick={(e) => { e.stopPropagation(); loadDirectory(item.path); }} className="p-2 -mr-2 rounded-lg hover:bg-emerald-100 text-slate-300 hover:text-emerald-600 transition-all group/arrow">
                  <FaChevronRight className="group-hover/arrow:translate-x-0.5 transition-transform" size={12} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Config */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">File_Name</label>
          <input value={fileName} onChange={(e) => setFileName(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Commit_Msg</label>
          <input value={commitMsg} onChange={(e) => setCommitMsg(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold focus:border-emerald-500 outline-none" />
        </div>
      </div>
    </div>
  );
};