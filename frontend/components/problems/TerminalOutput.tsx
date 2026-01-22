"use client";
import { FormLabel } from "@/components/ui/Form";
import { FaCheckCircle, FaTimesCircle, FaLock } from "react-icons/fa";

export const TerminalOutput = ({ 
  output, 
  testCases, 
  activeTab, 
  setActiveTab 
}: { 
  output: string, 
  testCases: any[], 
  activeTab: "testcase" | "result",
  setActiveTab: (tab: "testcase" | "result") => void
}) => {
  return (
    <div className="h-full w-full bg-[#1a1a1a] p-6 flex flex-col gap-4 overflow-hidden">
      <div className="flex gap-4 border-b border-gray-800 pb-2 shrink-0">
        <button 
          onClick={() => setActiveTab("testcase")}
          className={`text-[10px] font-black uppercase transition-all pb-1 ${
            activeTab === "testcase" ? "text-white border-b-2 border-emerald-500" : "text-gray-500"
          }`}
        >
          Testcase
        </button>
        <button 
          onClick={() => setActiveTab("result")}
          className={`text-[10px] font-black uppercase transition-all pb-1 ${
            activeTab === "result" ? "text-white border-b-2 border-emerald-500" : "text-gray-500 hover:text-white"
          }`}
        >
          Result
        </button>
      </div>

      <div className="flex-1 bg-[#252526] border-2 border-gray-600 rounded-md p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
        {activeTab === "testcase" ? (
          <div className="space-y-4">
            <FormLabel>Sample_Inputs</FormLabel>
            {testCases?.map((tc, i) => {
              const isPassed = tc.status === "PASSED";
              const hasRun = !!tc.status;

              return (
                <div key={i} className={`border-l-4 p-4 rounded bg-[#1a1a1a]/50 transition-all ${
                  !hasRun ? "border-gray-600" : isPassed ? "border-emerald-500" : "border-red-500"
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${
                      !hasRun ? "text-gray-500" : isPassed ? "text-emerald-500" : "text-red-500"
                    }`}>
                      Case_0{i + 1} {!tc.isSample && "[HIDDEN]"}
                    </p>
                    {hasRun && (
                      isPassed ? <FaCheckCircle className="text-emerald-500" /> : <FaTimesCircle className="text-red-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <span className="text-[8px] text-gray-500 uppercase font-black">Input:</span>
                      <pre className="text-white mt-1">{tc.input || "n/a"}</pre>
                    </div>
                    
                    {tc.isSample ? (
                      <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-2 mt-2">
                        <div>
                          <span className="text-[8px] text-gray-500 uppercase font-black">Expected:</span>
                          <pre className="text-emerald-400 mt-1">{tc.expectedOutput}</pre>
                        </div>
                        <div>
                          <span className="text-[8px] text-gray-500 uppercase font-black">Actual:</span>
                          {/* Color logic: Green if passed, Red if failed */}
                          <pre className={`${isPassed ? "text-emerald-400" : "text-red-400"} mt-1`}>
                            {hasRun ? tc.actualOutput : "---"}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 italic text-[10px] bg-black/20 p-2 rounded">
                        <FaLock size={10} /> Output hidden for private test case
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <FormLabel>Console_Output</FormLabel>
            <pre className={`mt-2 whitespace-pre-wrap ${output.includes("Error") || output.includes("FAILED") ? "text-red-400" : "text-emerald-400"}`}>
              {output || "> System idle. Execute script to view logs."}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};