"use client";

import { useEffect, useMemo, useState } from "react";
import { SubmissionRecord } from "@/types/workspace.types";
import { Editor } from "@monaco-editor/react";
import { cleanError } from "@/utils/error-cleaner.util";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { FiArrowLeft, FiCopy, FiCheck, FiClock, FiCpu } from "react-icons/fi";
import { submissionService } from "@/lib/services/submission.service";

const LANG_MAP: Record<number, string> = {
  63: "javascript",
  71: "python",
  62: "java",
  54: "cpp",
};
const LANG_LABEL: Record<number, string> = {
  63: "JavaScript",
  71: "Python",
  62: "Java",
  54: "C++",
};

function computePercentile(arr: number[], value: number): number {
  if (!arr.length) return 0;
  const beaten = arr.filter((v) => v > value).length;
  return Math.round((beaten / arr.length) * 100);
}

function buildHistogram(
  arr: number[],
  buckets: number,
): { x: number; count: number }[] {
  if (!arr.length) return [];
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  if (min === max) return [{ x: min, count: arr.length }];
  const step = (max - min) / buckets;
  const hist = Array.from({ length: buckets }, (_, i) => ({
    x: min + i * step + step / 2,
    count: 0,
  }));
  for (const v of arr) {
    const idx = Math.min(Math.floor((v - min) / step), buckets - 1);
    hist[idx].count++;
  }
  return hist;
}

function DistributionChart({
  values,
  myValue,
  unit,
  label,
}: {
  values: number[];
  myValue: number;
  unit: string;
  label: string;
}) {
  const hist = useMemo(() => buildHistogram(values, 20), [values]);
  const percentile = useMemo(
    () => computePercentile(values, myValue),
    [values, myValue],
  );
  const maxCount = Math.max(...hist.map((b) => b.count), 1);
  const myValueDisplay = unit === "ms" ? myValue * 1000 : myValue / 1024;

  return (
    <div className="bg-[#1a1a1a] rounded-sm p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-[11px] font-black text-emerald-400">
          Beats{" "}
          <span className="text-lg text-emerald-300">{percentile}%</span> of
          submissions
        </p>
      </div>

      <div className="flex items-end gap-px h-16">
        {hist.map((bar, i) => {
          const barDisplay =
            unit === "ms" ? bar.x * 1000 : bar.x / 1024;
          const isMyBar =
            Math.abs(barDisplay - myValueDisplay) <=
            (unit === "ms" ? 5 : 0.1);
          const height = Math.max(2, Math.round((bar.count / maxCount) * 64));
          return (
            <div
              key={i}
              title={`${barDisplay.toFixed(unit === "ms" ? 0 : 1)} ${unit}: ${bar.count}`}
              className={`flex-1 rounded-t-sm transition-all ${
                isMyBar ? "bg-emerald-400" : "bg-slate-700"
              }`}
              style={{ height }}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-[9px] text-slate-600 font-mono">
        <span>
          {unit === "ms"
            ? `${(Math.min(...values) * 1000).toFixed(0)} ms`
            : `${(Math.min(...values) / 1024).toFixed(1)} MB`}
        </span>
        <span className="text-emerald-400 font-black">
          You:{" "}
          {unit === "ms"
            ? `${(myValue * 1000).toFixed(0)} ms`
            : `${(myValue / 1024).toFixed(1)} MB`}
        </span>
        <span>
          {unit === "ms"
            ? `${(Math.max(...values) * 1000).toFixed(0)} ms`
            : `${(Math.max(...values) / 1024).toFixed(1)} MB`}
        </span>
      </div>
    </div>
  );
}

export const SubmissionDetail = ({
  submission,
  onBack,
  problemId,
}: {
  submission: SubmissionRecord;
  onBack: () => void;
  problemId?: number;
}) => {
  const isAccepted = submission.status === "ACCEPTED";
  const { output } = useSelector((state: RootState) => state.workspace);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<
    { time: number | null; memory: number | null }[]
  >([]);

  useEffect(() => {
    if (!isAccepted || !problemId) return;
    submissionService
      .getStats(String(problemId), submission.languageId)
      .then((res) => {
        if (res.success) setStats(res.stats);
      })
      .catch(() => {});
  }, [submission.id, isAccepted, problemId, submission.languageId]);

  const runtimeValues = useMemo(
    () => stats.map((s) => s.time).filter((v): v is number => v != null),
    [stats],
  );
  const memoryValues = useMemo(
    () => stats.map((s) => s.memory).filter((v): v is number => v != null),
    [stats],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(submission.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const statusColor: Record<string, string> = {
    ACCEPTED: "text-emerald-400",
    WRONG_ANSWER: "text-red-400",
    COMPILATION_ERROR: "text-amber-400",
    RUNTIME_ERROR: "text-orange-400",
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-200 transition-colors group"
      >
        <FiArrowLeft
          size={11}
          className="group-hover:-translate-x-0.5 transition-transform"
        />
        All Submissions
      </button>

      {/* Status */}
      <div>
        <h2
          className={`text-2xl font-black uppercase tracking-tight ${
            statusColor[submission.status] ?? "text-slate-300"
          }`}
        >
          {submission.status.replace(/_/g, " ")}
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
          {new Date(submission.createdAt).toLocaleString()} &middot;{" "}
          {LANG_LABEL[submission.languageId] ?? "Unknown"}
          {submission.totalPassed != null && submission.totalCases != null && (
            <span className="ml-2 text-slate-600">
              {submission.totalPassed}/{submission.totalCases} cases passed
            </span>
          )}
        </p>
      </div>

      {/* Error */}
      {!isAccepted && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-sm p-4">
          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-2">
            Error Output
          </p>
          <pre className="text-red-300 text-[12px] font-mono whitespace-pre-wrap leading-relaxed">
            {cleanError(
              submission.failMessage ||
                (typeof output === "string" ? output : ""),
            ) || "No error details captured."}
          </pre>
        </div>
      )}

      {/* Metrics */}
      {isAccepted && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1a1a] rounded-sm p-4 flex items-center gap-3">
            <FiClock size={16} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Runtime
              </p>
              <p className="text-lg font-black text-white font-mono">
                {submission.time != null
                  ? `${(submission.time * 1000).toFixed(0)} ms`
                  : "—"}
              </p>
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-sm p-4 flex items-center gap-3">
            <FiCpu size={16} className="text-blue-400 shrink-0" />
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Memory
              </p>
              <p className="text-lg font-black text-white font-mono">
                {submission.memory != null
                  ? `${(submission.memory / 1024).toFixed(1)} MB`
                  : "—"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Distribution charts */}
      {isAccepted && runtimeValues.length > 1 && submission.time != null && (
        <DistributionChart
          values={runtimeValues}
          myValue={submission.time}
          unit="ms"
          label="Runtime Distribution"
        />
      )}
      {isAccepted && memoryValues.length > 1 && submission.memory != null && (
        <DistributionChart
          values={memoryValues}
          myValue={submission.memory}
          unit="MB"
          label="Memory Distribution"
        />
      )}

      {/* Code viewer */}
      <div className="rounded-sm overflow-hidden border border-slate-800">
        <div className="bg-[#252526] px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {LANG_LABEL[submission.languageId] ?? "Code"}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white transition-colors"
          >
            {copied ? (
              <FiCheck size={11} className="text-emerald-400" />
            ) : (
              <FiCopy size={11} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="h-80">
          <Editor
            height="100%"
            language={LANG_MAP[submission.languageId] ?? "javascript"}
            value={submission.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'Fira Code', monospace",
              lineNumbers: "on",
              padding: { top: 12 },
              scrollBeyondLastLine: false,
              renderLineHighlight: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};
