"use client";

import React, { useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { CodeEditor } from "@/components/problems/CodeEditor";
import { TerminalOutput } from "@/components/problems/TerminalOutput";
import { FormButton } from "@/components/ui/Form";
import { ProblemDescription } from "@/components/problems/ProblemDescription";

export default function WorkspacePage() {
  const [code, setCode] = useState(
    `// Write your code here\nconsole.log("Hello World");`,
  );
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden">
      {/* Navbar */}
      <div className="h-16 shrink-0 border-b border-gray-700 bg-[#252526] flex items-center px-6 justify-between">
        <span className="font-black text-white tracking-widest">
          JUDGE<span className="text-emerald-500">0</span>
        </span>
        <FormButton isLoading={isRunning}>Run</FormButton>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          {/* LEFT: QUESTION */}
          <Panel minSize="20%" maxSize="70%">
            <ProblemDescription />
          </Panel>
          <Separator />
          <Panel minSize="30%" maxSize="80%">
            {/* RIGHT: WORKSPACE */}
            <Group orientation="vertical">
              {/* EDITOR */}
              <Panel minSize="20%" maxSize="70%">
                <CodeEditor code={code} setCode={setCode} language={language} />
              </Panel>
              <Separator />
              {/* CONSOLE */}
              <Panel>
                <TerminalOutput output={output} />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
