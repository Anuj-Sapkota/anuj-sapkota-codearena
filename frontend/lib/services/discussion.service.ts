// services/discussion.service.ts
import api from "../api";
import { CreateDiscussionDTO, Discussion } from "@/types/discussion.types.js";

export const discussionService = {
  getByProblem: async (problemId: number) => {
    const response = await api.get(`/discussions/problem/${problemId}`);
    return response.data;
  },

  create: async (data: CreateDiscussionDTO) => {
    const response = await api.post("/discussions", data);
    return response.data;
  },

  // Added Update
  update: async (id: string, data: Partial<CreateDiscussionDTO>) => {
    const response = await api.patch(`/discussions/${id}`, data);
    return response.data;
  },

  toggleUpvote: async (discussionId: string) => {
    const response = await api.post(`/discussions/${discussionId}/upvote`);
    return response.data;
  },

  delete: async (discussionId: string) => {
    const response = await api.delete(`/discussions/${discussionId}`);
    return response.data;
  },
};