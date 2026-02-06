"use client";
import { Challenge } from "@/types/challenge.types";
import React from "react";
import { FaStar, FaChevronRight, FaUsers } from "react-icons/fa";

export const ChallengeCard = ({ challenge }: { challenge: any }) => {
  // 1. Define the color mapping based on difficulty
  const difficultyConfig = {
    EASY: {
      border: "hover:border-emerald-500",
      accent: "bg-emerald-500",
      button: "hover:bg-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    MEDIUM: {
      border: "hover:border-amber-500",
      accent: "bg-amber-500",
      button: "hover:bg-amber-500",
      text: "text-amber-600",
      bg: "bg-amber-50",
    },
    HARD: {
      border: "hover:border-rose-500",
      accent: "bg-rose-500",
      button: "hover:bg-rose-500",
      text: "text-rose-600",
      bg: "bg-rose-50",
    },
  };

  // Fallback to MEDIUM if difficulty is undefined or doesn't match
  const config = difficultyConfig[challenge.difficulty as keyof typeof difficultyConfig] || difficultyConfig.MEDIUM;

  return (
    <div className={`group bg-white border border-slate-200 p-6 transition-all hover:shadow-2xl ${config.border} flex flex-col justify-between relative overflow-hidden`}>
      
      {/* Dynamic Visual Accent */}
      <div className={`absolute top-0 left-0 w-1 h-0 ${config.accent} transition-all duration-300 group-hover:h-full`} />

      <div>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[10px] font-bold ${config.bg} ${config.text} px-2 py-1 rounded uppercase tracking-wider border border-transparent group-hover:border-current transition-colors`}>
            {challenge.difficulty || "Medium"}
          </span>
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
            <FaStar size={10} />
            <span>{challenge.points || 100}</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-800 transition-colors">
          {challenge.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 font-medium mb-6">
          {challenge.description ||
            "Master complex algorithmic patterns in this curated challenge."}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1 text-[11px] font-bold">
            <FaUsers size={12} />
            <span>1.2k</span>
          </div>
        </div>
        
        {/* Dynamic Button Hover */}
        <button className={`flex items-center gap-2 bg-slate-900 text-white px-5 py-2 text-[10px] cursor-pointer font-black uppercase tracking-widest ${config.button} transition-all group-hover:scale-105 active:scale-95`}>
          Solve <FaChevronRight size={8} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};