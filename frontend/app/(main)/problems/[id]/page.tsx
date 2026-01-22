"use client";

import React, { useState, useEffect, use } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { CodeEditor } from "@/components/problems/CodeEditor";
import { TerminalOutput } from "@/components/problems/TerminalOutput";
import { FormButton } from "@/components/ui/Form";
import { ProblemDescription } from "@/components/problems/ProblemDescription";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  // ADDED THIS: To control the child component's tabs
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/problems/${resolvedParams.id}`,
        );
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
  setOutput("> Initializing Test Suite...");
  setActiveTab("result"); // Switch to console view initially

  try {
    const res = await axios.post("http://localhost:5000/api/submissions/submit", {
      source_code: code,
      language_id: 63,
      problemId: problem.problemId 
    });

    const { success, results, totalPassed, totalCases, allPassed } = res.data;

    if (!success || !results) {
      toast.error("Execution encountered an error.");
      setOutput("> Error: System failed to retrieve results.");
      return;
    }

    // 1. Map backend results to your local problem state
    const updatedTestCases = problem.testCases.map((tc: any, index: number) => {
      const result = results[index];
      return {
        ...tc,
        actualOutput: result?.stdout || result?.stderr || result?.compile_output || "---",
        status: result?.status?.id === 3 ? "PASSED" : "FAILED"
      };
    });
    
    setProblem({ ...problem, testCases: updatedTestCases });

    // 2. Show first output in console for quick reference
    const firstResult = results[0];
    setOutput(firstResult?.stdout || firstResult?.stderr || firstResult?.compile_output || "> No output received.");

    // 3. Global Feedback
    if (allPassed) {
      toast.success(`ACCEPTED: ${totalPassed}/${totalCases} PASSED`, {
        icon: '🚀',
        style: { background: '#10b981', color: '#fff' }
      });
    } else {
      toast.error(`FAILED: ${totalPassed}/${totalCases} PASSED`);
      setActiveTab("testcase"); // Auto-switch to show the red/green markers
    }

  } catch (err: any) {
    toast.error("COMMUNICATION_LINK_FAILURE");
    setOutput("> Connection to Judge0 server lost.");
  } finally {
    setIsRunning(false);
  }
};
  if (loading) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-mono text-xs tracking-widest animate-pulse">
            LOADING_DATA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden">
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
        <FormButton onClick={handleRun} isLoading={isRunning}>
          Run_
        </FormButton>
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
                {/* PASSED TABS AND SETTER HERE */}
                <TerminalOutput
                  output={output}
                  testCases={problem?.testCases}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
