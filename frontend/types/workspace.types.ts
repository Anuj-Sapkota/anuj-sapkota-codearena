export interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  status: {
    id: number; // 3: Accepted, 4: Wrong Answer, 6: Compilation Error, etc.
    description: string;
  };
}

export interface ExecutionMetrics {
  runtime: string;
  memory: string;
}

export interface SubmissionRecord {
  id: string;
  status:
    | "ACCEPTED"
    | "WRONG_ANSWER"
    | "COMPILATION_ERROR"
    | "RUNTIME_ERROR"
    | string;
  time: number | null; // Stored as seconds (e.g., 0.124)
  memory: number | null; // Stored as KB (e.g., 3480)
  createdAt: string; // ISO Date string from backend
  code: string;
  languageId: number; // Useful for syntax highlighting when viewing old code
  totalPassed?: number; // Optional: show "12/15 passed" in history
  totalCases?: number;
  failMessage?: string;
  stderr?: string;
}

export interface WorkspaceState {
  codes: Record<string, string>;
  selectedLanguage: {
    id: string;
    label: string;
    judge0Id: number;
  };
  isRunning: boolean;
  output: string;
  metrics: ExecutionMetrics | null;
  results: Judge0Result[];
  activeTab: "testcase" | "result" | "submissions";
  submissions: SubmissionRecord[];
  isFetchingHistory: boolean;
  descriptionTab: "description" | "submissions" | "detail";
  selectedSubmission: SubmissionRecord | null;
}

export interface RunCodeResponse {
  success: boolean;
  results: Judge0Result[];
  totalPassed: number;
  totalCases: number;
  allPassed: boolean;
  metrics: ExecutionMetrics | null;
  newSubmission?: SubmissionRecord;
}

// If DisplayTestCase isn't imported, define it here:
export interface DisplayTestCase {
  id: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: "PASSED" | "FAILED" | "IDLE";
  isSample: boolean;
}

export interface TerminalOutputProps {
  output: string;
  testCases: DisplayTestCase[];
  activeTab: "testcase" | "result" | "submissions";
  setActiveTab: (tab: "testcase" | "result" | "submissions") => void;
  metrics: { runtime: string; memory: string } | null;
  submissions: SubmissionRecord[]; // No more 'any'
  isFetchingHistory: boolean;
}

export interface MetricTileProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isAccepted: boolean;
}