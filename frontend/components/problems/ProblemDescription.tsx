"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store/store";
import { FormLabel } from "@/components/ui/Form";
import { MarkdownRenderer } from "@/components/problems/MarkdownRenderer";
import {
  setDescriptionTab,
  setSelectedSubmission,
} from "@/lib/store/features/workspace/workspace.slice";
import { SubmissionDetail } from "./SubmissionDetail";
import { SubmissionList } from "./SubmissionList";
import { MdDescription, MdList } from "react-icons/md";

export const ProblemDescription = ({ problem }: { problem: any }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { descriptionTab, selectedSubmission } = useSelector(
    (state: RootState) => state.workspace,
  );

  const handleBackToList = () => {
    dispatch(setDescriptionTab("submissions"));
    dispatch(setSelectedSubmission(null));
  };

  if (!problem) {
    return (
      <div className="p-8 text-slate-400 font-mono text-xs italic animate-pulse tracking-widest">
        SYSTEM_INITIALIZING...
      </div>
    );
  }

  const isActive = (tab: string) => {
    if (tab === "description") return descriptionTab === "description";
    if (tab === "submissions")
      return descriptionTab === "submissions" || descriptionTab === "detail";
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe]">
      {/* DASHBOARD TABS */}
      <div className="flex bg-[#18181b] border-b border-black px-2 shrink-0">
        {[
          { id: "description", label: "Description", icon: <MdDescription /> },
          { id: "submissions", label: "Submissions", icon: <MdList /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch(setDescriptionTab(tab.id as any))}
            className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] transition-all relative ${
              isActive(tab.id)
                ? "text-emerald-400 bg-[#27272a]"
                : "text-slate-500 hover:text-slate-300 hover:bg-[#27272a]/50"
            }`}
          >
            <span className="text-sm">{tab.icon}</span>
            {tab.label}
            {isActive(tab.id) && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {/* VIEWPORT */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10 text-slate-900">
        {descriptionTab === "description" && (
          <div className="animate-in fade-in slide-in-from-left-3 duration-500 max-w-4xl">
            <div className="mb-8">
              <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-2 uppercase">
                {problem.title || "Untitled_Problem"}
              </h1>

              <div className="flex flex-wrap gap-2">
                {/* DYNAMIC DIFFICULTY BADGE - Based on your string field */}
                <span
                  className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest border ${
                    problem.difficulty === "EASY"
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : problem.difficulty === "MEDIUM"
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : problem.difficulty === "HARD"
                          ? "bg-rose-100 text-rose-700 border-rose-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {problem.difficulty || "UNKNOWN"}_DIFFICULTY
                </span>

                {/* DYNAMIC CATEGORIES - Mapping from your Category[] relation */}
                {problem.categories && problem.categories.length > 0 ? (
                  problem.categories.map((cat: any) => (
                    <span
                      key={cat.id || cat.name}
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase tracking-widest border border-slate-200"
                    >
                      {cat.name.replace(/\s+/g, "_").toUpperCase()}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase tracking-widest border border-slate-200">
                    Category_General
                  </span>
                )}
              </div>
            </div>

            {/* PROSE SECTION */}
            <div className="prose prose-slate max-w-none">
              <MarkdownRenderer
                content={problem.content}
                className="text-slate-700 leading-relaxed text-[15px]"
              />
            </div>

            {/* CONSTRAINTS SECTION - Using your Float/Int schema fields */}
            <div className="mt-12 pt-10 border-t-2 border-slate-100 space-y-6">
              <FormLabel>Execution_Constraints</FormLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ConstraintCard
                  label="Memory_Limit"
                  value={`${problem.memoryLimit || "128"} MB`}
                  footer="Maximum Heap Allocation"
                />
                <ConstraintCard
                  label="Time_Limit"
                  value={`${problem.timeLimit?.toFixed(1) || "1.0"} SECONDS`}
                  footer="Per Testcase Execution"
                />
              </div>
            </div>
          </div>
        )}

        {descriptionTab === "submissions" && (
          <div className="animate-in fade-in duration-500">
            <SubmissionList />
          </div>
        )}

        {descriptionTab === "detail" && selectedSubmission ? (
          <div className="animate-in zoom-in-95 fade-in duration-500">
            <SubmissionDetail
              submission={selectedSubmission}
              onBack={handleBackToList}
            />
          </div>
        ) : descriptionTab === "detail" ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300 font-mono text-[10px] uppercase tracking-[0.3em]">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-300 rounded-full animate-spin mb-4" />
            Synchronizing_State...
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ConstraintCard = ({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer: string;
}) => (
  <div className="group bg-white border-2 border-slate-100 p-5 rounded-2xl flex flex-col gap-1 shadow-sm transition-all hover:border-emerald-500/30 hover:shadow-md">
    <span className="text-slate-400 text-[9px] mb-1 font-black tracking-[0.2em] uppercase">
      {label}
    </span>
    <span className="text-xl font-black text-slate-800 tracking-tight">
      {value}
    </span>
    <span className="text-[9px] text-slate-400 font-medium mt-2 italic group-hover:text-emerald-600 transition-colors">
      {footer}
    </span>
  </div>
);
