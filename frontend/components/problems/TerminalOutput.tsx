"use client";

import { RootState } from "@/lib/store/store";
import { TerminalOutputProps } from "@/types/workspace.types";
import { cleanError } from "@/utils/error-cleaner.util";
import React from "react";
import { useSelector } from "react-redux";

export const TerminalOutput = ({
  output,
  testCases,
  activeTab,
  setActiveTab,
}: TerminalOutputProps) => {
  console.log("This is the output 123", output);
  const { selectedSubmission } = useSelector(
    (state: RootState) => state.workspace,
  );
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
            {testCases?.map((tc, i) => (
              <div
                key={i}
                className="border border-gray-800 p-3 rounded bg-[#252526]"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Case {i + 1}</span>
                  <span
                    className={
                      tc.status === "PASSED"
                        ? "text-emerald-500"
                        : "text-red-500"
                    }
                  >
                    {tc.status || "READY"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-1">Input</p>
                    <pre className="bg-[#1e1e1e] p-2 rounded text-gray-300">
                      {tc.input}
                    </pre>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Expected</p>
                    <pre className="bg-[#1e1e1e] p-2 rounded text-gray-300">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-emerald-400/80 leading-relaxed">
            {cleanError(selectedSubmission?.failMessage || output) ||
              "> Ready to execute..."}
          </pre>
        )}
      </div>
    </div>
  );
};
