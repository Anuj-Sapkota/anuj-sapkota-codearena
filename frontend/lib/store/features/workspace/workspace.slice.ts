import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { runCodeThunk, fetchSubmissionHistoryThunk } from "./workspace.actions";
import { WorkspaceState, SubmissionRecord } from "@/types/workspace.types";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", judge0Id: 63 },
  { id: "python", label: "Python", judge0Id: 71 },
  { id: "java", label: "Java", judge0Id: 62 },
  { id: "cpp", label: "C++", judge0Id: 54 },
];

const initialState: WorkspaceState = {
  codes: { javascript: "", python: "", java: "", cpp: "" },
  selectedLanguage: LANGUAGES[0],
  isRunning: false,
  isFetchingHistory: false,
  output: "",
  results: [],
  submissions: [],
  metrics: null,
  activeTab: "testcase",
  descriptionTab: "description",
  selectedSubmission: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    initCodes: (state, action: PayloadAction<Record<string, string>>) => {
      const incoming = action.payload;
      state.codes = {
        javascript: incoming.javascript || "",
        python: incoming.python || "",
        java: incoming.java || "",
        cpp: incoming.cpp || "",
      };
    },
    updateCode: (state, action: PayloadAction<string>) => {
      state.codes[state.selectedLanguage.id] = action.payload;
    },
    changeLanguage: (state, action: PayloadAction<string>) => {
      const lang = LANGUAGES.find((l) => l.id === action.payload);
      if (lang) state.selectedLanguage = lang;
    },
    setActiveTab: (
      state,
      action: PayloadAction<"testcase" | "result" | "submissions">,
    ) => {
      state.activeTab = action.payload;
    },
    setDescriptionTab: (
      state,
      action: PayloadAction<"description" | "submissions" | "detail">,
    ) => {
      state.descriptionTab = action.payload;
    },
    setSelectedSubmission: (
      state,
      action: PayloadAction<SubmissionRecord | null>,
    ) => {
      state.selectedSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- RUN / SUBMIT CODE LOGIC ---
      .addCase(runCodeThunk.pending, (state) => {
        state.isRunning = true;
        state.output = "> Running code against test cases...";
        state.activeTab = "result";
        state.results = [];
        state.metrics = null;
      })
      .addCase(runCodeThunk.fulfilled, (state, action) => {
        state.isRunning = false;
        state.results = action.payload.results || [];
        state.metrics = action.payload.metrics || null;

        if (action.meta.arg.isFinal && action.payload.newSubmission) {
          state.submissions = [
            action.payload.newSubmission,
            ...state.submissions,
          ];
          state.selectedSubmission = action.payload.newSubmission;
          state.descriptionTab = "detail";
        }

        // NEW LOGIC: Look for a failed test case to extract the error
        const errorResult = action.payload.results?.find(
          (r) => r.status?.id !== 3,
        );

        if (errorResult) {
          // Prioritize compile_output for C++, then stderr for JS/Python
          state.output =
            errorResult.compile_output ||
            errorResult.stderr ||
            errorResult.message ||
            "> Execution Failed";
        } else {
          state.output = "> Execution finished.";
        }
      })
      .addCase(runCodeThunk.rejected, (state, action) => {
        state.isRunning = false;
        state.output = (action.payload as string) || "> Execution Error.";
      })

      // --- SUBMISSION HISTORY LOGIC (FETCH ON REFRESH) ---
      .addCase(fetchSubmissionHistoryThunk.pending, (state) => {
        state.isFetchingHistory = true;
        // Optional: Clear old submissions when starting a new fetch for a new problem
        state.submissions = [];
      })
      .addCase(fetchSubmissionHistoryThunk.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        // action.payload must be the array of submissions
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissionHistoryThunk.rejected, (state) => {
        state.isFetchingHistory = false;
        state.submissions = []; // Clear on error
      });
  },
  // ...
});

export const {
  initCodes,
  updateCode,
  changeLanguage,
  setActiveTab,
  setDescriptionTab,
  setSelectedSubmission,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
