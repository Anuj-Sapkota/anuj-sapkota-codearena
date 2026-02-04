"use client";

import { useState, useEffect, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlay,
  FaChevronLeft,
  FaCloudUploadAlt,
  FaGithub,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { GithubRepoModal } from "@/components/github/modals/GithubRepoModal";

interface ProblemHeaderProps {
  handleRun: () => void;
  handleSubmit: () => void;
  isRunning: boolean;
  isSubmitting: boolean;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

export const ProblemHeader = ({
  handleRun,
  handleSubmit,
  isRunning,
  isSubmitting,
  scrollContainerRef,
}: ProblemHeaderProps) => {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRepoModalOpen, setIsRepoModalOpen] = useState(false);

  const { user } = useSelector((state: RootState) => state.auth);
  const { selectedSubmission } = useSelector(
    (state: RootState) => state.workspace,
  );

  const isGithubConnected = !!user?.github_id;

  /**
   * FIX: Only show the GitHub button if the submission is specifically "ACCEPTED".
   * This prevents users from pushing failing code or starter boilerplate.
   */
  const isAccepted = selectedSubmission?.status === "ACCEPTED";
  const shouldShowGithub = !!selectedSubmission && isAccepted;

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  const handleGithubClick = () => {
    if (!isGithubConnected) {
      const backendUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      window.location.href = `${backendUrl}/auth/github`;
    } else {
      setIsRepoModalOpen(true);
    }
  };

  return (
    <>
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
          <FaChevronLeft
            size={10}
            className="group-hover:-translate-x-1 transition-transform"
          />
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
          {/* GitHub Push Button - Now conditionally rendered based on 'isAccepted' */}
          <AnimatePresence>
            {shouldShowGithub && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={handleGithubClick}
                className={`flex items-center justify-center gap-2 font-bold transition-all active:scale-95 border hover:bg-zinc-700 text-white shadow-md ${
                  isGithubConnected
                    ? "border-emerald-500/50 bg-zinc-800"
                    : "border-zinc-600 bg-zinc-800"
                } ${
                  isScrolled
                    ? "w-8 h-8 rounded-full"
                    : "px-4 py-2 rounded-lg text-xs"
                }`}
              >
                <FaGithub
                  size={isScrolled ? 16 : 14}
                  className={
                    isGithubConnected ? "text-emerald-500" : "text-white"
                  }
                />
                {!isScrolled && (
                  <span>
                    {isGithubConnected ? "Push_Code" : "Connect_GitHub"}
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Run Button */}
          <motion.button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            layout
            className={`relative flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-white font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isScrolled
                ? "w-8 h-8 rounded-full"
                : "px-4 py-2 rounded-lg gap-2 text-xs"
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
              isScrolled
                ? "w-8 h-8 rounded-full"
                : "px-5 py-2 rounded-lg gap-2 text-xs"
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

      <GithubRepoModal
        isOpen={isRepoModalOpen}
        onClose={() => setIsRepoModalOpen(false)}
      />
    </>
  );
};
