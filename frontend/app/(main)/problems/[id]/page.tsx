"use client";

import React, { useEffect, use, useRef, useState } from "react";
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
import { Problem } from "@/types/problem.types";
import {
  initCodes,
  updateCode,
  changeLanguage,
  setActiveTab,
  setDescriptionTab,
  setSelectedSubmission,
} from "@/lib/store/features/workspace/workspace.slice";

import {
  runCodeThunk,
  fetchSubmissionHistoryThunk,
} from "@/lib/store/features/workspace/workspace.actions";
import { fetchProblemByIdThunk } from "@/lib/store/features/problems/problem.actions";
import { DisplayTestCase } from "@/types/workspace.types";
import { cleanError } from "@/utils/error-cleaner.util";

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

  const [isSubmittingMode, setIsSubmittingMode] = useState(false);

  const { currentProblem, isLoading: problemLoading } = useSelector(
    (state: RootState) => state.problem,
  );

  const {
    codes,
    selectedLanguage,
    isRunning,
    output,
    activeTab,
    results,
    metrics,
    submissions,
    isFetchingHistory,
  } = useSelector((state: RootState) => state.workspace);

  const problem = currentProblem as Problem | null;

  useEffect(() => {
    const loadWorkspace = async () => {
      const action = await dispatch(fetchProblemByIdThunk(resolvedParams.id));
      if (fetchProblemByIdThunk.fulfilled.match(action)) {
        const problemData = action.payload.data;
        let starter = problemData.starterCode;
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
        toast.error("Failed to load environment.");
        router.push("/problems");
      }
    };
    loadWorkspace();
  }, [resolvedParams.id, dispatch, router]);

  useEffect(() => {
    if (activeTab === "submissions" && problem?.problemId) {
      dispatch(fetchSubmissionHistoryThunk(problem.problemId.toString()));
    }
  }, [activeTab, problem?.problemId, dispatch]);

  const handleExecute = async (isFinal: boolean) => {
    if (!problem?.problemId) return;

    const currentCode = codes[selectedLanguage.id];

    if (!currentCode || currentCode.trim().length === 0) {
      dispatch(setActiveTab("result"));
      toast.error("Code cannot be empty.");
      return;
    }

    setIsSubmittingMode(isFinal);

    try {
      const resultAction = await dispatch(
        runCodeThunk({
          sourceCode: currentCode,
          langId: selectedLanguage.judge0Id,
          problemId: problem.problemId.toString(),
          isFinal,
        }),
      );

      if (runCodeThunk.fulfilled.match(resultAction)) {
        console.log(
          "BACKEND_SUBMISSION_DATA:",
          resultAction.payload.newSubmission,
        ); //---------------------____DEBUG____------------------------
        const { allPassed, newSubmission } =
          resultAction.payload;

        // --- CASE: FINAL SUBMISSION (Submit Button) ---
        if (isFinal && newSubmission) {
          // 1. EXTRACT THE ERROR: Find the first result that has stderr or compile_output
          const errorResult = results?.find(
            (r: any) => r.stderr || r.compile_output || r.message,
          );
          const actualError =
            errorResult?.stderr ||
            errorResult?.compile_output ||
            errorResult?.message ||
            "";

          // 2. PATCH THE SUBMISSION: Add the error to the object manually
          const patchedSubmission = {
            ...newSubmission,
            failMessage: actualError, // Now SubmissionDetail will find it!
          };

          // 3. DISPATCH THE PATCHED VERSION
          dispatch(setSelectedSubmission(patchedSubmission));
          dispatch(setDescriptionTab("detail"));

          if (newSubmission.status === "ACCEPTED") {
            toast.success(`SUBMITTED`, {
              icon: "🚀",
            });
          } else {
            dispatch(setActiveTab("result"));
            toast.error(
              `SUBMISSION FAILED`,
            );
          }
        }

        // --- CASE: RUN CODE (Run Button) ---
        else {
          dispatch(setActiveTab("result"));
          if (allPassed) {
            toast.success("Accepted", {
              icon: "🏆",
            });
          } else {
            toast.error(`FAILED`);
          }
        }
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("An error occurred during execution.");
    } finally {
      setIsSubmittingMode(false);
    }
  };

  const displayTestCases: DisplayTestCase[] = (problem?.testCases || []).map(
    (tc, index) => {
      const executionResult = results?.[index];
      const actual = executionResult?.stdout?.trim() || "";
      const expected = tc.expectedOutput?.toString().trim() || "";
      const hasRun = results && results.length > 0;

      const isCorrect =
        executionResult?.status?.id === 3 && actual === expected;

      // Apply the error cleaner to any stderr or compile_output
      const errorMessage = cleanError(
        executionResult?.stderr || executionResult?.compile_output,
      );

      return {
        id: tc.testCaseId || index,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isSample: tc.isSample,
        actualOutput: actual || errorMessage || "---",
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
        handleRun={() => handleExecute(false)}
        handleSubmit={() => handleExecute(true)}
        isRunning={isRunning && !isSubmittingMode}
        isSubmitting={isRunning && isSubmittingMode}
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
                  <div className="flex bg-[#2d2d2d] border-b border-gray-800 shrink-0">
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
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      code={codes[selectedLanguage.id] || ""}
                      setCode={(val: string) => dispatch(updateCode(val))}
                      language={selectedLanguage.id}
                    />
                  </div>
                </div>
              </Panel>

              <Separator className="h-1 bg-gray-800 hover:bg-emerald-500 transition-colors cursor-row-resize" />

              <Panel defaultSize={40}>
                <TerminalOutput
                  output={output}
                  testCases={displayTestCases}
                  activeTab={activeTab}
                  setActiveTab={(tab) => dispatch(setActiveTab(tab))}
                  metrics={metrics}
                  submissions={submissions}
                  isFetchingHistory={isFetchingHistory}
                />
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
