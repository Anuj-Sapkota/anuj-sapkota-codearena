import api from "@/lib/api";

export interface ResourceModule {
  id?: string; // Added ID for existing modules
  title: string;
  url: string;
  type?: string;
  isLocked?: boolean; // Added for public view logic
}

export interface ResourceData {
  id?: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  modules: ResourceModule[];
  creator?: {
    name: string;
  };
}

export const resourceService = {
  // ---------------------------------------------------------
  // 🎓 PUBLIC / STUDENT METHODS (For /learn and /learn/[id])
  // ---------------------------------------------------------

  /**
   * Fetch all published resources for the Explore/Learn page
   * Includes optional search filtering
   */
  getExploreResources: async (search: string = "") => {
    const { data } = await api.get("/resources/explore", {
      params: { search },
    });
    // Handle both old flat array and new paginated response
    return Array.isArray(data) ? data : (data.items || []);
  },

  /**
   * Fetch a single resource for the Public Detail page.
   * Note: Backend should strip video URLs if user hasn't purchased.
   */
  getPublicResourceById: async (id: string) => {
    const { data } = await api.get(`/resources/public/${id}`);
    return data;
  },

  // ---------------------------------------------------------
  // 🛠️ INSTRUCTOR / CREATOR METHODS (Existing)
  // ---------------------------------------------------------

  // 🚀 CREATE
  createSeries: async (resourceData: ResourceData) => {
    const { data } = await api.post("/resources/create-series", resourceData);
    return data;
  },

  // 🚀 READ (List)
  getMyResources: async () => {
    const response = await api.get("/resources/my-resources");
    return response.data;
  },

  // 🚀 READ (Single for Editing)
  getResourceById: async (id: string) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  // 🚀 UPDATE
  updateResource: async (id: string, resourceData: ResourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },

  // 🚀 DELETE
  deleteResource: async (id: string) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};
