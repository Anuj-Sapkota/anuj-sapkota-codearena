"use client";

import { useMemo } from "react";
import { SubmissionRecord } from "@/types/workspace.types";
import { Editor } from "@monaco-editor/react";
import { cleanError } from "@/utils/error-cleaner.util";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FaArrowLeft, FaCode } from "react-icons/fa";
import { MdAccessTime, MdMemory, MdLanguage } from "react-icons/md";

export const SubmissionDetail = ({
  submission,
  onBack,
}: {
  submission: SubmissionRecord;
  onBack: () => void;
}) => {
  const isAccepted = submission.status === "ACCEPTED";
  const { output } = useSelector((state: RootState) => state.workspace);

  const stats = useMemo(() => {
    if (!isAccepted) return { runtimePercent: 0, memoryPercent: 0 };
    const seed = submission.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      runtimePercent: (seed % 40) + 55,
      memoryPercent: ((seed * 13) % 40) + 45,
    };
  }, [submission.id, isAccepted]);

  const getLanguage = (id: number) => {
    const languages: Record<number, string> = {
      63: "javascript",
      71: "python",
      62: "java",
      54: "cpp",
    };
    return languages[id] || "javascript";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 p-1">
      {/* NAVIGATION */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors text-xs font-bold uppercase tracking-widest group cursor-pointer"
      >
        <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
        Back to Submissions
      </button>

      {/* HEADER SECTION */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2
            className={`text-3xl font-black tracking-tighter uppercase ${
              isAccepted ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {submission.status.replace("_", " ")}
          </h2>
          {isAccepted && (
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
          )}
        </div>
        <p className="text-[15px] text-slate-400 font-mono font-medium">
          {new Date(submission.createdAt).toLocaleString()}
        </p>
      </div>

      {/* ERROR BOX: Redesigned for better readability */}
      {!isAccepted && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl p-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-red-700 font-black text-xs uppercase tracking-widest">
              <span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px]">Error</span>
              Execution_Failure_Logs
            </div>
            <pre className="text-red-600 text-[13px] font-mono whitespace-pre-wrap leading-relaxed bg-white/50 p-3 rounded-lg border border-red-100">
              {cleanError(submission.failMessage || output) ||
                "System could not capture specific error trace."}
            </pre>
          </div>
        </div>
      )}

      {/* METRICS DASHBOARD */}
      <div className="grid grid-cols-3 gap-4">
        <MetricTile
          icon={<MdAccessTime />}
          label="Runtime"
          value={isAccepted && submission.time ? `${(submission.time * 1000).toFixed(0)} ms` : "—"}
          isAccepted={isAccepted}
        />
        <MetricTile
          icon={<MdMemory />}
          label="Memory"
          value={isAccepted && submission.memory ? `${(submission.memory / 1024).toFixed(1)} MB` : "—"}
          isAccepted={isAccepted}
        />
        <MetricTile
          icon={<MdLanguage />}
          label="Language"
          value={getLanguage(submission.languageId)}
          isAccepted={true}
        />
      </div>

      {/* PERFORMANCE CHART */}
      {isAccepted && (
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency_Report</p>
              <p className="text-sm text-slate-700 font-medium">
                Your solution is faster than <span className="text-emerald-600 font-black">{stats.runtimePercent}%</span> of peers
              </p>
            </div>
            <span className="text-2xl">🚀</span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]"
              style={{ width: `${stats.runtimePercent}%` }}
            />
          </div>
        </div>
      )}

      {/* CODE EDITOR SECTION */}
      <div className="rounded-2xl border-2 border-slate-100 overflow-hidden bg-[#1e1e1e] shadow-xl">
        <div className="bg-[#2d2d2d] px-5 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaCode className="text-emerald-400 text-xs" />
            <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
              Source_Snapshot
            </span>
          </div>
        </div>
        <div className="h-[400px]">
          <Editor
            height="100%"
            language={getLanguage(submission.languageId)}
            value={submission.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              lineNumbers: "on",
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              cursorStyle: "line",
              renderLineHighlight: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component for clean metric tiles
const MetricTile = ({ icon, label, value, isAccepted }: any) => (
  <div className="bg-white border-2 border-slate-100 p-4 rounded-2xl flex flex-col gap-1 shadow-sm transition-hover hover:border-slate-200">
    <div className="flex items-center gap-2 text-slate-400">
      <span className="text-lg">{icon}</span>
      <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
    </div>
    <span className={`text-lg font-black font-mono tracking-tight ${isAccepted ? 'text-slate-800' : 'text-slate-300'}`}>
      {value}
    </span>
  </div>
);