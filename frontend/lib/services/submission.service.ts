"use client";

import api from "../api";

export const submissionService = {
  submitCode: async (
    sourceCode: string,
    langId: number,
    problemId: string,
    isFinal: boolean = false,
    challengeSlug: string | null,
  ) => {

    console.log("Challenge id from frontend -submission service: ", challengeSlug)
    const response = await api.post("/submissions/submit", {
      source_code: sourceCode,
      language_id: langId,
      problemId,
      isFinal,
      challengeSlug, 
    });

    return response.data;
  },

  getHistory: async (problemId: string) => {
    const response = await api.get(`/submissions/history/${problemId}`);
    return response.data;
  },
};