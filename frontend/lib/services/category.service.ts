import api from "../api";

export const categoryService = {
  create: async (data: {
    name: string;
    slug: string;
    description?: string;
  }) => {
    const response = await api.post("/categories/create", data);
    return response.data; // Should return { success: true, data: categoryObject }
  },

  getAll: async () => {
    const response = await api.get("/categories");
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  update: async (id: number, data: { name?: string; slug?: string; description?: string }) => {
    const response = await api.put(`/categories/update/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/categories/delete/${id}`);
    return response.data;
  }
};
