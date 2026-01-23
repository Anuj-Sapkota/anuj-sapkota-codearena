"use client";

import { FormLabel } from "@/components/ui/Form";
import { MarkdownRenderer } from "@/components/problems/MarkdownRenderer";

export const ProblemDescription = ({ problem }: { problem: any }) => {
  if (!problem) {
    return (
      <div className="p-8 text-gray-400 font-mono italic animate-pulse">
        LOADING_PROBLEM_DATA...
      </div>
    );
  }

  return (
    <div className="h-full w-full p-8 overflow-y-auto bg-white text-gray-900 border-r-2 border-gray-800 shadow-inner custom-scrollbar">
      {/* SECTION: HEADER */}
      <FormLabel>Problem_Statement</FormLabel>
      
      <h1 className="text-4xl font-black uppercase tracking-tighter mt-2 mb-8 text-slate-900 border-b-4 border-slate-900 pb-2 italic">
        {problem.title}
      </h1>
      
      {/* SECTION: CONTENT (Shared Renderer) */}
      <div className="w-full">
        {/* We use the shared renderer here. 
          If the workspace background is white, we keep text-gray-900.
          If you ever switch the workspace to dark mode, just change className to text-gray-300.
        */}
        <MarkdownRenderer 
          content={problem.content} 
          className="text-gray-900" 
        />
      </div>
      
      {/* SECTION: CONSTRAINTS */}
      <div className="mt-10 pt-8 border-t-2 border-dashed border-slate-200 space-y-4">
        <FormLabel>System_Constraints</FormLabel>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-100 border text-emerald-500 p-4 rounded-md font-mono text-[11px] uppercase flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-slate-500 text-[9px] mb-1 font-black tracking-widest">
              Memory_Limit
            </span>
            {problem.memoryLimit || '256'} MB
          </div>
          <div className="bg-slate-100 border text-emerald-500 p-4 rounded-md font-mono text-[11px] uppercase flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-slate-500 text-[9px] mb-1 font-black tracking-widest">
              Time_Limit
            </span>
            {problem.timeLimit || '2.0'} SECONDS
          </div>
        </div>
      </div>
    </div>
  );
};