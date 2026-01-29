"use client";

import React, { useEffect, use, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Panel, Group, Separator } from "react-resizable-panels";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Components
import { CodeEditor } from "@/components/problems/CodeEditor";
import { TerminalOutput } from "@/components/problems/TerminalOutput";
import { ProblemDescription } from "@/components/problems/ProblemDescription";
import { ProblemHeader } from "@/components/problems/ProblemHeader";

// Types & Redux
import { RootState, AppDispatch } from "@/lib/store/store";
import { Problem, TestCase } from "@/types/problem.types"; // Ensure these interfaces are exported
import {
  initCodes,
  updateCode,
  changeLanguage,
  setActiveTab,
} from "@/lib/store/features/workspace/workspace.slice";

import { runCodeThunk } from "@/lib/store/features/workspace/workspace.actions";
import { fetchProblemByIdThunk } from "@/lib/store/features/problems/problem.actions";

// Define the shape of the test case displayed in the Terminal
export interface DisplayTestCase extends TestCase {
  actualOutput: string;
  status: "PASSED" | "FAILED" | "IDLE";
}

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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Typed Selectors
  const { currentProblem, isLoading: problemLoading } = useSelector(
    (state: RootState) => state.problem,
  );

  const { codes, selectedLanguage, isRunning, output, activeTab, results } =
    useSelector((state: RootState) => state.workspace);

  // Cast currentProblem to Problem type safely
  const problem = currentProblem as Problem | null;

  useEffect(() => {
    const loadWorkspace = async () => {
      const action = await dispatch(fetchProblemByIdThunk(resolvedParams.id));

      if (fetchProblemByIdThunk.fulfilled.match(action)) {
        const problemData = action.payload.data;

        // Populate editor safely. If starterCode is a string (JSON), parse it.
        // If it's already an object, use it directly.
        let starter = problemData.starterCode;

        // Fix for the "Property does not exist on type string" error:
        if (typeof starter === "string") {
          try {
            starter = JSON.parse(starter);
          } catch (e) {
            starter = {};
          }
        }

        dispatch(
          initCodes({
            javascript: starter?.javascript || "",
            python: starter?.python || "",
            java: starter?.java || "",
            cpp: starter?.cpp || "",
          }),
        );
      } else if (fetchProblemByIdThunk.rejected.match(action)) {
        toast.error("Failed to load problem environment.");
        router.push("/problems");
      }
    };

    loadWorkspace();
  }, [resolvedParams.id, dispatch, router]);

  const handleRun = async () => {
    if (!problem?.problemId) return;

    const resultAction = await dispatch(
      runCodeThunk({
        sourceCode: codes[selectedLanguage.id],
        langId: selectedLanguage.judge0Id,
        problemId: problem.problemId.toString(),
      }),
    );

    if (runCodeThunk.fulfilled.match(resultAction)) {
      const { allPassed, totalPassed, totalCases } = resultAction.payload;
      if (allPassed) {
        toast.success(`ACCEPTED: ${totalPassed}/${totalCases} PASSED`, {
          icon: "🚀",
        });
      } else {
        toast.error(`FAILED: ${totalPassed}/${totalCases} PASSED`);
      }
    }
  };

  // Transform Test Cases for UI
  const displayTestCases: DisplayTestCase[] = (problem?.testCases || []).map(
    (tc, index) => {
      const executionResult = results?.[index];
      const actual = executionResult?.stdout?.trim() || "";
      const expected = tc.expectedOutput?.toString().trim() || "";

      const hasRun = results && results.length > 0;
      const isCorrect =
        executionResult?.status?.id === 3 && actual === expected;

      return {
        ...tc,
        actualOutput:
          actual ||
          executionResult?.stderr ||
          executionResult?.compile_output ||
          "---",
        status: !hasRun ? "IDLE" : isCorrect ? "PASSED" : "FAILED",
      };
    },
  );

  if (problemLoading) {
    return (
      <div className="h-screen bg-[#1a1a1a] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
          Syncing_Environment...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1a1a1a] overflow-hidden">
      <ProblemHeader
        handleRun={handleRun}
        isRunning={isRunning}
        scrollContainerRef={descriptionRef}
      />

      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          <Panel defaultSize={45} minSize={30}>
            <div
              ref={descriptionRef}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <ProblemDescription problem={problem} />
            </div>
          </Panel>

          <Separator className="w-1 bg-gray-800 hover:bg-emerald-500 transition-colors cursor-col-resize" />

          <Panel defaultSize={55}>
            <Group orientation="vertical">
              <Panel defaultSize={60} minSize={20}>
                <div className="flex flex-col h-full bg-[#1e1e1e]">
                  <div className="flex bg-[#2d2d2d] border-b border-gray-800">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => dispatch(changeLanguage(lang.id))}
                        className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${
                          selectedLanguage.id === lang.id
                            ? "bg-[#1e1e1e] text-emerald-400 border-t-2 border-emerald-500"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                  <CodeEditor
                    code={codes[selectedLanguage.id] || ""}
                    setCode={(val: string) => dispatch(updateCode(val))}
                    language={selectedLanguage.id}
                  />
                </div>
              </Panel>

              <Separator className="h-1 bg-gray-800 hover:bg-emerald-500 transition-colors cursor-row-resize" />

              <Panel defaultSize={40}>
                <TerminalOutput
                  output={output}
                  testCases={displayTestCases}
                  activeTab={activeTab}
                  setActiveTab={(tab) => dispatch(setActiveTab(tab))}
                />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
