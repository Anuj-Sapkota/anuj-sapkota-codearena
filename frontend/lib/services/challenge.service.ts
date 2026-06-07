import api from "@/lib/api";
import { API } from "@/constants/api.constants";
import { CreateChallengeDTO, Challenge } from "@/types/challenge.types";

export const challengeService = {
  create: async (data: CreateChallengeDTO) => {
    const response = await api.post(API.CHALLENGES.BASE, data);
    return response.data;
  },

  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const response = await api.get(API.CHALLENGES.BASE, { params });
    return response.data;
  },

  getBySlug: async (slug: string): Promise<{ success: boolean; data: Challenge }> => {
    const response = await api.get(API.CHALLENGES.BY_SLUG(slug));
    return response.data;
  },

  update: async (id: number, data: Partial<CreateChallengeDTO>) => {
    const response = await api.patch(API.CHALLENGES.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(API.CHALLENGES.BY_ID(id));
    return response.data;
  },

  getPublic: async () => {
    const response = await api.get(API.CHALLENGES.PUBLIC);
    return response.data;
  },
};
