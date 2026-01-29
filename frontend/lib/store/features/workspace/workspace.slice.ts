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

        // AUTOMATION: If it was a final submission
        if (action.meta.arg.isFinal && action.payload.newSubmission) {
          // 1. Manually add the new submission to the history list (at the top)
          state.submissions = [action.payload.newSubmission, ...state.submissions];
          
          // 2. Set as selected and switch to detail view
          state.selectedSubmission = action.payload.newSubmission;
          state.descriptionTab = "detail";
        }

        const first = action.payload.results?.[0];
        if (first) {
          state.output =
            first.compile_output ||
            first.stderr ||
            first.stdout ||
            "> Execution finished.";
        } else {
          state.output = "> No results returned.";
        }
      })
      .addCase(runCodeThunk.rejected, (state, action) => {
        state.isRunning = false;
        state.output = (action.payload as string) || "> Execution Error.";
        state.metrics = null;
      })

      // --- SUBMISSION HISTORY LOGIC ---
      .addCase(fetchSubmissionHistoryThunk.pending, (state) => {
        state.isFetchingHistory = true;
      })
      .addCase(fetchSubmissionHistoryThunk.fulfilled, (state, action) => {
        state.isFetchingHistory = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissionHistoryThunk.rejected, (state) => {
        state.isFetchingHistory = false;
      });
  },
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