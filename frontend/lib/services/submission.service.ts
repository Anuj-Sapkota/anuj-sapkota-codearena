import api from "../api";

export const submissionService = {
  submitCode: async (
    sourceCode: string, // Changed name to match Thunk
    langId: number, // Changed name to match Thunk
    problemId: string,
    isFinal: boolean = false,
  ) => {
    const response = await api.post("/submissions/submit", {
      source_code: sourceCode, // Map to snake_case for backend
      language_id: langId, // Map to snake_case for backend
      problemId,
      isFinal,
    });

    return response.data;
  },

  getHistory: async (problemId: string) => {
    const response = await api.get(`/submissions/history/${problemId}`);
    return response.data;
  },
};
