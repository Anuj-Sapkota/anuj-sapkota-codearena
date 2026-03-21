import api from "@/lib/api";

export const resourceService = {
  createSeries: async (resourceData: {
    title: string;
    description: string;
    price: number;
    thumbnail: string;
    modules: { title: string; url: string; type: string }[];
  }) => {
    const { data } = await api.post("/resources/create-series", resourceData);
    return data;
  },

  getMyResources: async () => {
    const response = await api.get("/resources/my-resources");
    return response.data;
  },

  getResourceById: async (id: string) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
};
