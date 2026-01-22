import { FormLabel } from "@/components/ui/Form";

export const TerminalOutput = ({ output }: any) => (
  <div className="h-full w-full bg-[#1a1a1a] p-6 flex flex-col gap-4 overflow-hidden">
    <div className="flex gap-4 border-b border-gray-800 pb-2 shrink-0">
      <button className="text-[10px] font-black uppercase text-white border-b-2 border-emerald-500 pb-1">Testcase</button>
      <button className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">Result</button>
    </div>
    <div className="flex-1 bg-[#252526] border-2 border-gray-600 rounded-md p-4 font-mono text-xs overflow-y-auto min-h-0">
      <FormLabel>Console_Output</FormLabel>
      <pre className="text-emerald-400 mt-2 whitespace-pre-wrap">
        {output || "> System initialized..."}
      </pre>
    </div>
  </div>
);