"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaChevronLeft } from "react-icons/fa";

export const ProblemHeader = ({ handleRun, isRunning, scrollContainerRef }: any) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor the scroll of the problem description/workspace
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
      className={`sticky top-0 z-50 transition-all duration-300 flex items-center px-6 justify-between border-b border-gray-700 bg-[#252526] ${
        isScrolled ? "h-12 shadow-xl" : "h-16"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => router.push("/problems")}
        className="flex items-center gap-2 text-gray-400 hover:text-white text-[10px] font-black tracking-widest transition-colors cursor-pointer"
      >
        <FaChevronLeft size={10} />
        <AnimatePresence>
          {!isScrolled && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              BACK
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Morphing Run Button */}
      <motion.button
        onClick={handleRun}
        disabled={isRunning}
        layout
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`relative flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg active:scale-95 ${
          isScrolled 
            ? "w-8 h-8 rounded-full p-0" 
            : "px-5 py-2 rounded-lg gap-2 text-xs"
        }`}
      >
        <FaPlay size={isScrolled ? 10 : 8} className={isScrolled ? "ml-0.5" : ""} />
        
        <AnimatePresence mode="wait">
          {!isScrolled && (
            <motion.span
              key="run-text"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="whitespace-nowrap overflow-hidden"
            >
              {isRunning ? "Running..." : "Run_"}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Loading Spinner overlay */}
        {isRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/80 rounded-inherit">
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </motion.button>
    </header>
  );
};