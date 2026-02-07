"use client";

import { RootState } from "@/lib/store/store";
import { TerminalOutputProps, RunCodeResponse, Judge0Result, DisplayTestCase } from "@/types/workspace.types";
import { cleanError } from "@/utils/error-cleaner.util";
import React from "react";
import { useSelector } from "react-redux";

export const TerminalOutput = ({
  output,
  testCases,
  activeTab,
  setActiveTab,
}: TerminalOutputProps) => {
  const { selectedSubmission } = useSelector(
    (state: RootState) => state.workspace,
  );

  // --- TYPE GUARD: Check if output is the full RunCodeResponse object ---
  const isRunResponse = (out: unknown): out is RunCodeResponse => {
    return typeof out === "object" && out !== null && "results" in out;
  };

  // Determine what actually gets mapped for display
  const displayData: (Judge0Result | DisplayTestCase)[] = isRunResponse(output)
    ? output.results
    : Array.isArray(output)
      ? output
      : testCases;

  // Safe message extraction for Console Logs
  const consoleMessage = isRunResponse(output)
    ? output.results.find((r) => r.stderr || r.compile_output)?.message || ""
    : typeof output === "string"
      ? output
      : "";

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] font-mono">
      {/* TABS */}
      <div className="flex gap-4 px-4 border-b border-gray-800 bg-[#252526]">
        <button
          onClick={() => setActiveTab("testcase")}
          className={`py-2 text-[10px] uppercase tracking-widest ${
            activeTab === "testcase"
              ? "text-emerald-500 border-b border-emerald-500"
              : "text-gray-500"
          }`}
        >
          Test_Cases
        </button>
        <button
          onClick={() => setActiveTab("result")}
          className={`py-2 text-[10px] uppercase tracking-widest ${
            activeTab === "result"
              ? "text-emerald-500 border-b border-emerald-500"
              : "text-gray-500"
          }`}
        >
          Console_Logs
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 text-xs">
        {activeTab === "testcase" ? (
          <div className="space-y-4">
            {displayData.map((tc, i) => {
              // Discriminant check: tc could be Judge0Result or DisplayTestCase
              const isCorrect = "isCorrect" in tc ? tc.isCorrect : (tc as DisplayTestCase).status === "PASSED";
              
              const actual = "decodedOutput" in tc ? tc.decodedOutput : (tc as DisplayTestCase).actualOutput;
              
              const statusLabel = "status" in tc && typeof tc.status === "object" 
                ? tc.status.description 
                : (tc as DisplayTestCase).status;

              return (
                <div
                  key={i}
                  className="border border-gray-800 p-3 rounded bg-[#252526]"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Case {i + 1}</span>
                    <span
                      className={
                        isCorrect ? "text-emerald-500" : "text-red-500 font-bold"
                      }
                    >
                      {isCorrect ? "✓ PASSED" : statusLabel || "FAILED"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-[10px] mb-1">INPUT</p>
                      <pre className="bg-[#1a1a1a] p-2 rounded text-gray-300">
                        {tc.input || "N/A"}
                      </pre>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-600 text-[10px] mb-1">EXPECTED</p>
                        <pre className="bg-[#1a1a1a] p-2 rounded text-gray-400">
                          {tc.expectedOutput || "N/A"}
                        </pre>
                      </div>

                      <div>
                        <p className="text-gray-600 text-[10px] mb-1">ACTUAL</p>
                        <pre
                          className={`p-2 rounded bg-[#1a1a1a] ${
                            isCorrect ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {actual || "No output"}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <pre className="text-emerald-400/80 leading-relaxed whitespace-pre-wrap">
            {cleanError(
              selectedSubmission?.failMessage || consoleMessage
            ) || "> Ready to execute..."}
          </pre>
        )}
      </div>
    </div>
  );
};