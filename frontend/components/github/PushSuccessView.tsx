import { FaRocket } from "react-icons/fa";

interface PushSuccessViewProps {
  url: string;
  onClose: () => void;
}

export const PushSuccessView = ({ url, onClose }: PushSuccessViewProps) => (
  <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
    <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in duration-300">
      <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
        <FaRocket size={32} />
      </div>
      <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
        Push_Success
      </h2>
      <p className="text-slate-500 text-sm mt-2 mb-8 leading-relaxed">
        Your solution has been successfully pushed to the cloud.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-lg active:scale-95 text-center"
      >
        View on GitHub
      </a>
      <button
        onClick={onClose}
        className="mt-6 text-slate-400 font-bold text-[10px] tracking-widest uppercase hover:text-slate-600 transition-colors"
      >
        Dismiss
      </button>
    </div>
  </div>
);