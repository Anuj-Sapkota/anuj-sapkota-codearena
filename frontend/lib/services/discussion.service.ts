// services/discussion.service.ts
import api from "../api";
import { CreateDiscussionDTO } from "@/types/discussion.types.js";

export const discussionService = {
  // Fetch top-level discussions for a specific problem
  getByProblem: async (problemId: number) => {
    const response = await api.get(`/discussions/problem/${problemId}`);
    return response.data;
  },

  // Create a new thread or a reply
  create: async (data: CreateDiscussionDTO) => {
    console.log("Create data from service frontend: ", data);
    const response = await api.post("/discussions", data);
    return response.data;
  },

  // Toggle upvote (uses numeric ID)
  toggleUpvote: async (discussionId: string) => {
    const response = await api.post(`/discussions/${discussionId}/upvote`);
    return response.data;
  },

  // Delete a comment (Admin or Owner)
  delete: async (discussionId: string) => {
    const response = await api.delete(`/discussions/${discussionId}`);
    return response.data;
  },
};