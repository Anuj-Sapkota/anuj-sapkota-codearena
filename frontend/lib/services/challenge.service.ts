import api from "../api";
import { CreateChallengeDTO, Challenge } from "@/types/challenge.types";

export const challengeService = {
  create: async (data: CreateChallengeDTO) => {
    const response = await api.post("/challenges", data);
    return response.data;
  },

  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get("/challenges", { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<{ success: boolean; data: Challenge }> => {
    const response = await api.get(`/challenges/${slug}`);
    return response.data;
  },

  // Target numeric ID for administrative stability
  update: async (challengeId: number, data: Partial<CreateChallengeDTO>) => {
    const response = await api.patch(`/challenges/${challengeId}`, data);
    return response.data;
  },

  // Target numeric ID for administrative stability
  delete: async (challengeId: number) => {
    const response = await api.delete(`/challenges/${challengeId}`);
    return response.data;
  },
};