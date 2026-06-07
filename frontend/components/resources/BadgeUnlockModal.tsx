"use client";

import { useEffect, useState } from "react";
import { FiAward, FiX, FiCheck } from "react-icons/fi";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface BadgeProps {
  badgeName: string;
  onClose: () => void;
}

export default function BadgeUnlockModal({ badgeName, onClose }: BadgeProps) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-6">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={500}
        colors={["#10b981", "#050505", "#ffffff"]}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white max-w-sm w-full p-10 text-center shadow-2xl relative border-t-[10px] border-emerald-500"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-900 transition-colors"
        >
          <FiX size={20} />
        </button>

        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 text-emerald-500 shadow-inner">
          <FiAward size={48} strokeWidth={1.5} />
        </div>

        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-2">
          Achievement Unlocked
        </h2>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 mb-4 leading-none">
          {badgeName}
        </h3>

        <p className="text-slate-400 text-[11px] font-bold uppercase leading-relaxed mb-8">
          You have successfully completed all modules in this series. Your
          dedication to learning has earned you this digital credential.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => (window.location.href = "/creator/dashboard")} // Change to your actual profile link
            className="w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
          >
            View in Profile
          </button>
          <button
            onClick={onClose}
            className="w-full py-4 text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-slate-900 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
}
