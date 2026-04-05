import api from "@/lib/api";
import { API } from "@/constants/api.constants";

export const submissionService = {
  submitCode: async (
    sourceCode: string,
    langId: number,
    problemId: string,
    isFinal: boolean = false,
    challengeSlug: string | null,
  ) => {
    const response = await api.post(`${API.SUBMISSIONS.BASE}/submit`, {
      source_code: sourceCode,
      language_id: langId,
      problemId,
      isFinal,
      challengeSlug,
    });
    return response.data;
  },

  getHistory: async (problemId: string) => {
    const response = await api.get(API.SUBMISSIONS.HISTORY(problemId));
    return response.data;
  },
};
