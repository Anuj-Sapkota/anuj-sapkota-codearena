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
};