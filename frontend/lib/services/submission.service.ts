import api from "../api"; // Adjust the path to where your api.ts is located

export const submissionService = {
  /**
   * Submits code to Judge0 via the backend
   * Uses the centralized 'api' instance to ensure credentials (cookies) are sent
   */
  submitCode: async (source_code: string, language_id: number, problemId: string) => {
    // Note: Since api.ts already has baseURL: config.apiUrl, 
    // we only need the relative path here.
    const response = await api.post("/submissions/submit", {
      source_code,
      language_id,
      problemId,
    });
    
    return response.data;
  },
};