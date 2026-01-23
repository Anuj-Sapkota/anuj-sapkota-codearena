import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { runCodeThunk } from "./workspace.actions";
import { WorkspaceState } from "@/types/workspace.types";

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
  output: "",
  results: [],
  activeTab: "testcase",
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    initCodes: (state, action: PayloadAction<Record<string, string>>) => {
      // Logic to handle if starterCode arrives as a string or object
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
    setActiveTab: (state, action: PayloadAction<"testcase" | "result">) => {
      state.activeTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runCodeThunk.pending, (state) => {
        state.isRunning = true;
        state.output = "> Running code against test cases...";
        state.activeTab = "result";
        state.results = [];
      })
      .addCase(runCodeThunk.fulfilled, (state, action) => {
        state.isRunning = false;
        state.results = action.payload.results;

        // Grab primary output from first test case
        const first = action.payload.results[0];
        state.output =
          first?.stdout ||
          first?.stderr ||
          first?.compile_output ||
          "> No output.";
      })
      .addCase(runCodeThunk.rejected, (state) => {
        state.isRunning = false;
        state.output = "> Execution Error: Connection to judge lost.";
      });
  },
});

export const { initCodes, updateCode, changeLanguage, setActiveTab } =
  workspaceSlice.actions;
export default workspaceSlice.reducer;
