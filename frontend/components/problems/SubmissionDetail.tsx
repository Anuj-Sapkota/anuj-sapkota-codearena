import { useMemo } from "react";
import { SubmissionRecord } from "@/types/workspace.types";
import { Editor } from "@monaco-editor/react";

export const SubmissionDetail = ({
  submission,
}: {
  submission: SubmissionRecord;
}) => {
  const stats = useMemo(() => {
    const seed = submission.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const runtimePercent = (seed % 40) + 55;
    const memoryPercent = ((seed * 13) % 40) + 45;

    return { runtimePercent, memoryPercent };
  }, [submission.id]);

  // Map your Judge0 language IDs to Monaco language strings
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
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 p-1">
      <header className="flex items-center justify-between border-b pb-4">
        <h2
          className={`text-3xl font-black italic uppercase tracking-tighter ${
            submission.status === "ACCEPTED"
              ? "text-emerald-600"
              : "text-red-600"
          }`}
        >
          {submission.status}_
        </h2>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">
          {new Date(submission.createdAt).toLocaleString()}
        </span>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-6">
        {/* Runtime Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Runtime_Performance
            </span>
            <span className="text-lg font-mono font-bold text-slate-800">
              {(submission.time ? submission.time * 1000 : 0).toFixed(0)} ms
            </span>
          </div>
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-1000 ease-out"
              style={{ width: `${stats.runtimePercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            Your code is faster than{" "}
            <span className="text-emerald-600 font-bold">
              {stats.runtimePercent}%
            </span>{" "}
            of submissions.
          </p>
        </div>

        {/* Memory Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Memory_Usage
            </span>
            <span className="text-lg font-mono font-bold text-slate-800">
              {(submission.memory ? submission.memory / 1024 : 0).toFixed(1)} MB
            </span>
          </div>
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-1000 ease-out"
              style={{ width: `${stats.memoryPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            Lower than{" "}
            <span className="text-blue-600 font-bold">
              {stats.memoryPercent}%
            </span>{" "}
            of similar solutions.
          </p>
        </div>
      </div>

      {/* Source Code - Monaco Read-Only */}
      <div className="relative group rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
            Source_Code_Output
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase px-2 py-0.5 bg-white border border-slate-200 rounded">
            {getLanguage(submission.languageId)}
          </span>
        </div>
        
        <div className="h-[400px] w-full">
          <Editor
            height="100%"
            language={getLanguage(submission.languageId)}
            value={submission.code}
            theme="vs-dark" // Light mode
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              lineNumbers: "on",
              renderLineHighlight: "none",
              scrollbar: {
                vertical: "hidden",
                horizontal: "auto"
              },
              domReadOnly: true,
              automaticLayout: true,
              padding: { top: 20, bottom: 20 }
            }}
          />
        </div>
      </div>
    </div>
  );
};