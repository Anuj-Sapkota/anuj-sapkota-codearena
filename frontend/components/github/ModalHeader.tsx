import { FaGithub } from "react-icons/fa";

interface ModalHeaderProps {
  step: number;
  path: string;
  onClose: () => void;
}

export const ModalHeader = ({ step, path, onClose }: ModalHeaderProps) => (
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
            : `Current Path: /${path || "root"}`}
        </p>
      </div>
    </div>
    <button
      onClick={onClose}
      className="text-emerald-100 hover:text-white transition-colors"
    >
      ✕
    </button>
  </div>
);