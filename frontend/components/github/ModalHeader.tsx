import { FiGithub, FiX } from "react-icons/fi";

interface ModalHeaderProps {
  step: number;
  path: string;
  onClose: () => void;
}

export const ModalHeader = ({ step, path, onClose }: ModalHeaderProps) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-slate-900 rounded-sm flex items-center justify-center shrink-0">
        <FiGithub size={15} className="text-white" />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
          {step === 1 ? "Select Repository" : "Choose Location"}
        </p>
        <p className="text-[9px] text-slate-400 font-bold mt-0.5">
          {step === 1 ? "Pick where to push your solution" : `/${path || "root"}`}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
    >
      <FiX size={14} />
    </button>
  </div>
);
