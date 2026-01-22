"use client";

import React, { useState, useEffect, use } from "react"; // Added 'use'
import { Panel, Group, Separator } from "react-resizable-panels";
import { CodeEditor } from "@/components/problems/CodeEditor";
import { TerminalOutput } from "@/components/problems/TerminalOutput";
import { FormButton } from "@/components/ui/Form";
import { ProblemDescription } from "@/components/problems/ProblemDescription";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Pro-way to unwrap params in Client Components
  const resolvedParams = use(params); 
  const router = useRouter();

  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  // 2. Optimized Fetching logic
  useEffect(() => {
  const fetchProblem = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/problems/${resolvedParams.id}`);
      
      // Access res.data.data because your backend wraps the result
      if (res.data && res.data.success) {
        setProblem(res.data.data); 
        setCode(res.data.data.starterCode || "// Start coding...");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchProblem();
}, [resolvedParams.id]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("> Executing on Judge0...");
    try {
      const res = await axios.post("http://localhost:5000/api/submissions/submit", {
        source_code: code,
        language_id: 63, 
        stdin: problem?.testCases?.[0]?.input || "" 
      });

      if (res.data.success) {
        setOutput(res.data.output.stdout || "Success: No Output");
      } else {
        setOutput(res.data.output.stderr || res.data.output.compile_output || "Execution Failed");
      }
    } catch (err) {
      setOutput("Connection Error: Check backend status.");
    } finally {
      setIsRunning(false);
    }
  };

  // 3. Proper Loading Guard (prevents 404/Crash)
  if (loading) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-mono text-xs tracking-widest animate-pulse">LOADING_DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden">
      {/* Navbar */}
      <div className="h-16 shrink-0 border-b border-gray-700 bg-[#252526] flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/problems")}
            className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-tighter"
          >
            ← Back
          </button>
          <div className="h-4 w-[2px] bg-gray-700 mx-2" />
         
        </div>
        <FormButton onClick={handleRun} isLoading={isRunning}>Run_</FormButton>
      </div>

      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          <Panel minSize="20%" defaultSize="55%" maxSize="70%">
            <ProblemDescription problem={problem} />
          </Panel>
          <Separator className="w-1 bg-gray-800 hover:bg-emerald-500 transition-colors" />
          <Panel minSize="30%" maxSize="80%" defaultSize="45%">
            <Group orientation="vertical">
              <Panel minSize="10%" defaultSize="55%" maxSize="90%">
                <CodeEditor code={code} setCode={setCode} language={language} />
              </Panel>
              <Separator className="h-1 bg-gray-800 hover:bg-emerald-500 transition-colors" />
              <Panel minSize="10%" defaultSize="45%" maxSize="90%">
                <TerminalOutput output={output} testCases={problem?.testCases} />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}