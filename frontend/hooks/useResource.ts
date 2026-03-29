// hooks/useResource.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "@/lib/services/resource.service";
import { toast } from "sonner";

// 🚀 Hook to FETCH resources for the dashboard
export const useMyResources = () => {
  return useQuery({
    queryKey: ["resources", "mine"], // Unique key for caching
    queryFn: resourceService.getMyResources,
    staleTime: 1000 * 60 * 5, // Data stays "fresh" for 5 minutes
  });
};

// Hook to CREATE a resource
export const useCreateResourceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resourceService.createSeries,
    onSuccess: () => {
      // 🚀 This forces the dashboard to re-fetch when a new resource is made
      queryClient.invalidateQueries({ queryKey: ["resources", "mine"] });
    },
  });
};

export const useResourceById = (id: string) => {
  return useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id, // Only run if ID exists
  });
};

export const useUpdateResourceMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => resourceService.updateResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resource", id] });
      queryClient.invalidateQueries({ queryKey: ["my-resources"] });
    },
  });
};

export const useDeleteResourceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => resourceService.deleteResource(id),
    onSuccess: () => {
      // 🚀 THE MAGIC LINE:
      // This tells React Query: "The list of resources is now wrong. Go fetch the new list immediately."
      queryClient.invalidateQueries({ queryKey: ["resources", "mine"] });

      toast.success("Resource permanently removed");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete resource");
    },
  });
};

export const useExploreResources = (search: string) => {
  return useQuery({
    // Adding search to the key ensures it re-fetches when you type
    queryKey: ["resources", "explore", search],
    queryFn: () => resourceService.getExploreResources(search),
  });
};

// Hook for the specific Course Detail page
export const usePublicResourceDetail = (id: string) => {
  return useQuery({
    queryKey: ["resource", "public", id],
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id, // Only run if ID exists
  });
};

export const useCreatorStats = () => {
  return useQuery({
    queryKey: ["creator-stats"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/resources/creator/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });
};