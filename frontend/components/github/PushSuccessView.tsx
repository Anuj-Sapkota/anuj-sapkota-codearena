import { FiGithub, FiExternalLink, FiX } from "react-icons/fi";

interface PushSuccessViewProps {
  url: string;
  onClose: () => void;
}

export const PushSuccessView = ({ url, onClose }: PushSuccessViewProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
      {/* Top bar */}
      <div className="h-1 w-full bg-emerald-500" />

      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-slate-900 rounded-sm flex items-center justify-center mx-auto mb-5">
          <FiGithub size={24} className="text-white" />
        </div>

        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter mb-1">
          Pushed Successfully
        </h2>
        <p className="text-[12px] text-slate-500 leading-relaxed mb-6">
          Your solution has been pushed to GitHub.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-slate-900 text-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all active:scale-95 mb-3"
        >
          <FiExternalLink size={12} /> View on GitHub
        </a>

        <button
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors py-2"
        >
          <FiX size={11} /> Close
        </button>
      </div>
    </div>
  </div>
);
