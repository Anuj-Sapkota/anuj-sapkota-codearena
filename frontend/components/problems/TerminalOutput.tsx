import { useState } from "react";
import { FormLabel } from "@/components/ui/Form";

export const TerminalOutput = ({ output, testCases }: { output: string, testCases: any[] }) => {
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");

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

      <div className="flex-1 bg-[#252526] border-2 border-gray-600 rounded-md p-4 font-mono text-xs overflow-y-auto min-h-0">
        <FormLabel>{activeTab === "testcase" ? "Sample_Inputs" : "Console_Output"}</FormLabel>
        
        <div className="mt-2">
          {activeTab === "testcase" ? (
            <div className="space-y-3">
              {testCases?.map((tc, i) => (
                <div key={i} className="border-l-2 border-emerald-500 pl-2 py-1 bg-[#1a1a1a]/50">
                  <p className="text-gray-400 text-[10px]">CASE {i + 1}:</p>
                  <p className="text-white">{tc.input}</p>
                </div>
              ))}
            </div>
          ) : (
            <pre className="text-emerald-400 whitespace-pre-wrap">
              {output || "> System initialized. Awaiting run..."}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};