import api from "../api";
import { CreateProblemDTO, Problem } from "@/types/problem.types";

export const problemService = {
  /**
   * Admin: Create a new problem
   */
  create: async (data: CreateProblemDTO) => {
    const response = await api.post("/problems", data);
    return response.data;
  },

  /**
   * Public & Admin: Get all problems
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    difficulty?: string;
    categoryIds?: string;
    sortBy?: string;
  }) => {
    const response = await api.get("/problems", {
      params, // Axios automatically converts this object into ?page=1&search=...
    });
    return response.data;
  },
  /**
   * Public: Get detailed problem data by slug
   */
  getById: async (
    id: string | number,
  ): Promise<{ success: boolean; data: Problem }> => {
    const response = await api.get(`/problems/${id}`);
    return response.data;
  },
  /**
   * Admin: Update problem details or test cases
   * FIXED: Removed '/update' from URL to match backend router.put("/:id")
   */
  update: async (id: number, data: Partial<CreateProblemDTO>) => {
    const response = await api.put(`/problems/${id}`, data);
    return response.data;
  },

  /**
   * Admin: Remove a problem from the registry
   * FIXED: Removed '/delete' from URL to match backend router.delete("/:id")
   */
  delete: async (id: number) => {
    const response = await api.delete(`/problems/${id}`);
    return response.data;
  },
};
