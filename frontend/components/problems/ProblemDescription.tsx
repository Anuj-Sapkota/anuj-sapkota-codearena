"use client";

import { FormLabel } from "@/components/ui/Form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ProblemDescription = ({ problem }: { problem: any }) => {
  if (!problem) return <div className="p-8 text-gray-400 font-mono italic">LOADING_PROBLEM_DATA...</div>;

  return (
    <div className="h-full w-full p-8 overflow-y-auto bg-white text-gray-900 border-r-2 border-gray-800 shadow-inner custom-scrollbar">
      <FormLabel>Problem_Statement</FormLabel>
      
      <h1 className="text-4xl font-black uppercase tracking-tighter mt-2 mb-8 text-slate-900 border-b-4 border-slate-900 pb-2 italic">
        {problem.title}
      </h1>
      
      {/* Markdown Container */}
      <div className="w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // EXACT SAME COMPONENTS AS ADMIN MODAL
            h1: ({ ...props }) => (
              <h1
                className="text-2xl font-black uppercase tracking-tight text-gray-900 border-b-2 border-gray-100 pb-2 mb-4 mt-8"
                {...props}
              />
            ),
            h2: ({ ...props }) => (
              <h2
                className="text-xl font-bold text-gray-800 mt-8 mb-3 uppercase tracking-tight"
                {...props}
              />
            ),
            h3: ({ ...props }) => (
              <h3
                className="text-lg font-black text-gray-800 mt-6 mb-2 uppercase tracking-tight"
                {...props}
              />
            ),
            p: ({ ...props }) => (
              <p
                className="text-gray-600 leading-relaxed mb-4 text-sm font-medium"
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul
                className="list-disc list-outside ml-5 mb-4 space-y-2 text-gray-600 text-sm"
                {...props}
              />
            ),
            ol: ({ ...props }) => (
              <ol
                className="list-decimal list-outside ml-5 mb-4 space-y-2 text-gray-600 text-sm"
                {...props}
              />
            ),
            li: ({ ...props }) => (
              <li className="pl-1" {...props} />
            ),
            code: ({ ...props }) => (
              <code
                className="bg-gray-100 text-primary-1 px-1.5 py-0.5 rounded text-xs font-mono font-bold border border-gray-200"
                {...props}
              />
            ),
            strong: ({ ...props }) => (
              <strong className="font-black text-gray-900" {...props} />
            ),
            blockquote: ({ ...props }) => (
              <blockquote className="border-l-4 border-primary-1 bg-gray-50 p-4 italic my-4 rounded-r" {...props} />
            )
          }}
        >
          {problem.content}
        </ReactMarkdown>
      </div>
      
      {/* Constraints Section */}
      <div className="mt-10 pt-8 border-t-2 border-dashed border-slate-200 space-y-4">
        <FormLabel>System_Constraints</FormLabel>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900 text-emerald-500 p-4 rounded-md font-mono text-[11px] uppercase flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-slate-500 text-[9px] mb-1 font-black tracking-widest">Memory_Limit</span>
            {problem.memoryLimit || '256'} MB
          </div>
          <div className="bg-slate-900 text-emerald-500 p-4 rounded-md font-mono text-[11px] uppercase flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
            <span className="text-slate-500 text-[9px] mb-1 font-black tracking-widest">Time_Limit</span>
            {problem.timeLimit || '2.0'} SECONDS
          </div>
        </div>
      </div>
    </div>
  );
};