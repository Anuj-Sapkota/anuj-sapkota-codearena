"use client";
import React, { useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { FormButton } from "@/components/ui/Form";
import { ProblemDescription } from "@/components/problems/ProblemDescription";
import { CodeEditor } from "@/components/problems/CodeEditor";
import { TerminalOutput } from "@/components/problems/TerminalOutput";

export default function WorkspacePage() {
  const [code, setCode] = useState<string>(
    `// Write your code here\nconsole.log("Hello World");`,
  );
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const HorizontalGroup = Group as any;
  const VerticalGroup = Group as any;

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Navbar */}
      <div className="h-16 border-b-2 border-gray-600 bg-[#252526] flex items-center px-6 justify-between shrink-0 z-10">
        <div className="flex items-center gap-8">
          <span className="font-black text-white uppercase italic text-sm tracking-[0.3em]">
            JUDGE<span className="text-emerald-500">0</span>_CORE
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#333] border-2 border-gray-600 rounded px-3 py-1 text-xs font-bold text-white outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <FormButton onClick={() => {}} isLoading={isRunning}>
          Run_
        </FormButton>
      </div>

      <div className="flex-1 overflow-hidden w-screen h-screen">
        {/* Main Horizontal Split: Question | CodeArea */}
        <HorizontalGroup direction="horizontal">
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription />
          </Panel>

          <Separator className="w-1.5 bg-gray-700 hover:bg-emerald-500 transition-all cursor-col-resize active:bg-emerald-400 shrink-0" />

          {/* Right Side: Vertical Split (Editor over Console) */}
          {/* Right Side: The container Panel MUST have h-full */}
          <Panel defaultSize={60} className="h-full">
            <VerticalGroup direction="vertical">
              {/* Editor Panel */}
              <Panel defaultSize={65} minSize={30}>
                <CodeEditor code={code} setCode={setCode} language={language} />
              </Panel>

              {/* The Separator needs h-1.5 to be visible and draggable */}
              <Separator className="h-1.5 bg-gray-700 hover:bg-emerald-500 transition-all cursor-row-resize active:bg-emerald-400 shrink-0" />

              {/* Terminal Panel */}
              <Panel defaultSize={35} minSize={15}>
                <TerminalOutput output={output} />
              </Panel>
            </VerticalGroup>
          </Panel>  
        </HorizontalGroup>
      </div>
    </div>
  );
}
