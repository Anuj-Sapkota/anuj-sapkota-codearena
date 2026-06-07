"use client";

import { FiXCircle, FiRefreshCw } from "react-icons/fi";

interface CreatorRejectionViewProps {
  reason: string | null;
  onReapply: () => void;
}

export default function CreatorRejectionView({ reason, onReapply }: CreatorRejectionViewProps) {
  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">
      <h2 className="text-xl font-black text-slate-900 uppercase mb-6 text-center md:text-left">
        Application Status
      </h2>
      <div className="border border-rose-100 bg-white p-10 rounded-sm shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center flex-shrink-0">
            <FiXCircle size={40} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
              Application Denied
            </h3>
            <div className="mt-4 p-5 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-sm italic">
              <strong>Admin Feedback:</strong> <br />
              &quot;{reason || "Your portfolio did not meet our current technical standards."}&quot;
            </div>
            <button
              onClick={onReapply}
              className="mt-8 flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              <FiRefreshCw /> Update Details & Re-Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}