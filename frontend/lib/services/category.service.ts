import api from "@/lib/api";
import { API } from "@/constants/api.constants";

export const categoryService = {
  create: async (data: { name: string; slug: string; description?: string }) => {
    const response = await api.post(API.CATEGORIES.BASE, data);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get(API.CATEGORIES.BASE);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(API.CATEGORIES.BY_ID(id));
    return response.data;
  },

  update: async (id: number, data: { name?: string; slug?: string; description?: string }) => {
    const response = await api.put(API.CATEGORIES.BY_ID(id), data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(API.CATEGORIES.BY_ID(id));
    return response.data;
  },
};
