"use client";

import React from "react";
import { ChallengeCard } from "./ChallengeCard";

export const ChallengeGrid = ({ challenges }: { challenges: any[] }) => {
  return (
    <div className="w-full">
      {/* Grid Controls (Search/Sort) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button className="text-[11px] font-black uppercase tracking-widest border-b-2 border-primary-1 pb-1">All_Challenges</button>
          <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors pb-1">Unsolved</button>
          <button className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors pb-1">Solved</button>
        </div>
      </div>

      {/* 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {challenges?.map((item) => (
          <ChallengeCard key={item.challengeId} challenge={item} />
        ))}
      </div>
    </div>
  );
};