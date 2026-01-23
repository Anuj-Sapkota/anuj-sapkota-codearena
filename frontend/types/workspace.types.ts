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

export interface WorkspaceState {
  codes: Record<string, string>;
  selectedLanguage: { 
    id: string; 
    label: string; 
    judge0Id: number 
  };
  isRunning: boolean;
  output: string;
  results: Judge0Result[];
  activeTab: "testcase" | "result";
}

export interface RunCodeResponse {
  success: boolean;
  results: Judge0Result[];
  totalPassed: number;
  totalCases: number;
  allPassed: boolean;
}