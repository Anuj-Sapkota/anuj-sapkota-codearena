"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaChevronLeft, FaCloudUploadAlt } from "react-icons/fa";

export const ProblemHeader = ({ 
  handleRun, 
  handleSubmit, 
  isRunning, 
  isSubmitting, 
  scrollContainerRef 
}: any) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 flex items-center px-6 justify-between border-b border-gray-700 bg-[#252526] ${
        isScrolled ? "h-12 shadow-xl" : "h-16"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/problems")}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-[10px] font-black tracking-widest transition-colors cursor-pointer group"
      >
        <FaChevronLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
        <AnimatePresence mode="wait">
          {!isScrolled && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -10 }}
            >
              BACK_TO_DASHBOARD
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="flex items-center gap-3">
        {/* Run Button */}
        <motion.button
          onClick={handleRun}
          disabled={isRunning || isSubmitting}
          layout
          className={`relative flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isScrolled ? "w-8 h-8 rounded-full" : "px-4 py-2 rounded-lg gap-2 text-xs"
          }`}
        >
          {isRunning ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FaPlay size={10} />
          )}
          {!isScrolled && <span>{isRunning ? "Running..." : "Run"}</span>}
        </motion.button>

        {/* Submit Button */}
        <motion.button
          onClick={handleSubmit}
          disabled={isRunning || isSubmitting}
          layout
          className={`relative flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            isScrolled ? "w-8 h-8 rounded-full" : "px-5 py-2 rounded-lg gap-2 text-xs"
          }`}
        >
          {isSubmitting ? (
             <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FaCloudUploadAlt size={isScrolled ? 14 : 12} />
          )}
          
          <AnimatePresence mode="wait">
            {!isScrolled && (
              <motion.span
                key={isSubmitting ? "submitting" : "submit"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="whitespace-nowrap overflow-hidden"
              >
                {isSubmitting ? "Submitting..." : "Submit_"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  );
};