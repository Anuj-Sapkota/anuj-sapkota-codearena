"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import { FormLabel } from "@/components/ui/Form";
import { MarkdownRenderer } from "@/components/problems/MarkdownRenderer";
import { setDescriptionTab } from "@/lib/store/features/workspace/workspace.slice";
import { SubmissionDetail } from "./SubmissionDetail"; // We'll create this below
import { SubmissionList } from "./SubmissionList";     // We'll create this below

export const ProblemDescription = ({ problem }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { descriptionTab, selectedSubmission } = useSelector(
    (state: RootState) => state.workspace
  );

  if (!problem) {
    return (
      <div className="p-8 text-gray-400 font-mono italic animate-pulse">
        LOADING_PROBLEM_DATA...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* TABS HEADER */}
      <div className="flex bg-[#252526] border-b border-gray-800 px-4 shrink-0">
        {["description", "submissions"].map((tab) => (
          <button
            key={tab}
            onClick={() => dispatch(setDescriptionTab(tab as any))}
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
              descriptionTab === tab || (tab === "submissions" && descriptionTab === "detail")
                ? "text-emerald-400 border-b-2 border-emerald-500 bg-[#1e1e1e]/50"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 text-gray-900">
        {descriptionTab === "description" && (
          <div className="animate-in fade-in duration-300">
            <FormLabel>Problem_Statement</FormLabel>
            <div className="w-full">
              <MarkdownRenderer content={problem.content} className="text-gray-900" />
            </div>

            <div className="mt-10 pt-8 border-t-2 border-dashed border-slate-200 space-y-4">
              <FormLabel>System_Constraints</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <ConstraintCard label="Memory_Limit" value={`${problem.memoryLimit || "256"} MB`} />
                <ConstraintCard label="Time_Limit" value={`${problem.timeLimit || "2.0"} SECONDS`} />
              </div>
            </div>
          </div>
        )}

        {descriptionTab === "submissions" && (
          <SubmissionList />
        )}

        {descriptionTab === "detail" && selectedSubmission && (
          <SubmissionDetail submission={selectedSubmission} />
        )}
      </div>
    </div>
  );
};

const ConstraintCard = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-slate-100 border text-emerald-600 p-4 rounded-md font-mono text-[11px] uppercase flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
    <span className="text-slate-500 text-[9px] mb-1 font-black tracking-widest">{label}</span>
    {value}
  </div>
);