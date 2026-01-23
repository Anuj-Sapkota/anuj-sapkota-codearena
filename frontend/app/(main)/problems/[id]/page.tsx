"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import { CodeEditor } from "@/components/problems/CodeEditor";
import { TerminalOutput } from "@/components/problems/TerminalOutput";
import { FormButton } from "@/components/ui/Form";
import { ProblemDescription } from "@/components/problems/ProblemDescription";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ProblemHeader } from "@/components/problems/ProblemHeader";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", judge0Id: 63 },
  { id: "python", label: "Python", judge0Id: 71 },
  { id: "java", label: "Java", judge0Id: 62 },
  { id: "cpp", label: "C++", judge0Id: 54 },
];

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const descriptionRef = useRef<HTMLDivElement>(null);
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState<"testcase" | "result">("testcase");

  // State for the currently selected language object
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  // State to hold code for ALL languages simultaneously
  const [codes, setCodes] = useState<Record<string, string>>({
    javascript: "",
    python: "",
    java: "",
    cpp: "",
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/problems/${resolvedParams.id}`,
        );
        if (res.data?.success) {
          const prob = res.data.data;
          setProblem(prob);
          // Initialize our local codes state with the starter code from DB
          setCodes({
            javascript: prob.starterCode?.javascript || "",
            python: prob.starterCode?.python || "",
            java: prob.starterCode?.java || "",
            cpp: prob.starterCode?.cpp || "",
          });
        }
      } catch (err) {
        toast.error("Failed to load problem data");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [resolvedParams.id]);

  const handleCodeChange = (newVal: string) => {
    setCodes((prev) => ({ ...prev, [selectedLang.id]: newVal }));
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("> Initializing Test Suite...");
    setActiveTab("result");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/submissions/submit",
        {
          source_code: codes[selectedLang.id], // Current language code string
          language_id: selectedLang.judge0Id, // Correct ID for the judge
          problemId: problem.problemId,
        },
      );

      const { results, totalPassed, totalCases, allPassed } = res.data;

      // Map backend results back to test cases for UI markers
      const updatedTestCases = problem.testCases.map(
        (tc: any, index: number) => {
          const result = results[index];

          // 1. Get the raw output and the expected output
          const actual = result?.stdout?.trim() || "";
          const expected = tc.expectedOutput?.toString().trim() || "";

          // 2. LOGIC FIX:
          // Status 3 means "Success" (the code didn't crash).
          // We only set "PASSED" if it didn't crash AND the output matches.
          const isCorrect = result?.status?.id === 3 && actual === expected;

          return {
            ...tc,
            actualOutput:
              actual || result?.stderr || result?.compile_output || "---",
            status: isCorrect ? "PASSED" : "FAILED",
          };
        },
      );

      // Update the problem state to reflect the new test case statuses (Red/Green)
      setProblem({ ...problem, testCases: updatedTestCases });

      // Show the primary output in the console log tab
      setOutput(
        results[0]?.stdout ||
          results[0]?.stderr ||
          results[0]?.compile_output ||
          "> Execution finished with no output.",
      );

      // Trigger the Toast notifications based on global success
      if (allPassed) {
        toast.success(`ACCEPTED: ${totalPassed}/${totalCases} PASSED`, {
          icon: "🚀",
        });
      } else {
        toast.error(`FAILED: ${totalPassed}/${totalCases} PASSED`);
        // Auto-switch back to test cases tab so the user can see which one failed
        setActiveTab("testcase");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      toast.error("Execution failed: Could not connect to judge.");
      setOutput("> Error: Communication link failure.");
    } finally {
      setIsRunning(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-[#1a1a1a] flex items-center justify-center text-emerald-500">
        LOADING...
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden">
      {/* HEADER */}
      <ProblemHeader
        handleRun={handleRun}
        isRunning={isRunning}
        scrollContainerRef={descriptionRef}
      />
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          <Panel defaultSize={50} minSize={20}>
            <div
              ref={descriptionRef}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <ProblemDescription problem={problem} />
            </div>
          </Panel>
          <Separator className="w-1 bg-gray-800 hover:bg-emerald-500" />
          <Panel defaultSize={50}>
            <Group orientation="vertical">
              {/* EDITOR PANEL */}
              <Panel defaultSize={60}>
                {/* LANGUAGE TABS */}
                <div className="flex bg-[#2d2d2d] border-b border-gray-800">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${
                        selectedLang.id === lang.id
                          ? "bg-[#1e1e1e] text-emerald-400 border-t-2 border-emerald-500"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
                <CodeEditor
                  code={codes[selectedLang.id]}
                  setCode={handleCodeChange}
                  language={selectedLang.id}
                />
              </Panel>
              <Separator className="h-1 bg-gray-800 hover:bg-emerald-500" />
              <Panel defaultSize={40}>
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
