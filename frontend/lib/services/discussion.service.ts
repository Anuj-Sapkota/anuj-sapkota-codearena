// services/discussion.service.ts
import api from "../api";
import { CreateDiscussionDTO } from "@/types/discussion.types.js";

export const discussionService = {

  // Get
 getByProblem: async (problemId: number, userId?: number, sortBy: string = "newest", language?: string, search?: string) => {
  const response = await api.get(`/discussions/problem/${problemId}`, {
    params: { userId, sortBy, language, search } 
  });
  return response.data;
},
  // create
  create: async (data: CreateDiscussionDTO) => {
    const response = await api.post("/discussions", data);
    return response.data;
  },

  //  Update
  update: async (id: string, data: Partial<CreateDiscussionDTO>) => {
    const response = await api.patch(`/discussions/${id}`, data);
    return response.data;
  },
  // upvote
  toggleUpvote: async (discussionId: string) => {
    const response = await api.post(`/discussions/${discussionId}/upvote`);
    return response.data;
  },

  // delete
  delete: async (discussionId: string) => {
    const response = await api.delete(`/discussions/${discussionId}`);
    return response.data;
  },

  // Report a discussion (User action)
  report: async (id: string, type: string, details: string) => {
    const response = await api.post(`/discussions/${id}/report`, { type, details });
    return response.data;
  },

  // Get all flagged discussions (Admin action)
  getFlagged: async () => {
    const response = await api.get("/discussions/reports/flagged");
    return response.data;
  },

  // Moderate: Block or Unblock (Admin action)
  moderate: async (id: string, action: "BLOCK" | "UNBLOCK") => {
    const response = await api.patch(`/discussions/${id}/moderate`, { action });
    return response.data;
  },
  
};