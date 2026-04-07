import api from "@/lib/api";
import { API } from "@/constants/api.constants";
import { CreateProblemDTO, Problem } from "@/types/problem.types";

export const problemService = {
  create: async (data: CreateProblemDTO) => {
    const response = await api.post(API.PROBLEMS.BASE, data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    categoryIds?: string;
    sortBy?: string;
  }) => {
    const response = await api.get(API.PROBLEMS.BASE, { params });
    return response.data;
  },

  getById: async (id: string | number): Promise<{ success: boolean; data: Problem }> => {
    const response = await api.get(API.PROBLEMS.BY_ID(id));
    return response.data;
  },

  update: async (id: number, data: Partial<CreateProblemDTO>) => {
    const response = await api.put(API.PROBLEMS.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(API.PROBLEMS.BY_ID(id));
    return response.data;
  },
};
