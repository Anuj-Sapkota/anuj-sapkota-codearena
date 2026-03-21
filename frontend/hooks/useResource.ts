// hooks/useResource.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { resourceService } from "@/lib/services/resource.service";

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

export const useResource = (id: string) => {
  return useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceService.getResourceById(id),
    enabled: !!id, // Only run if ID exists
  });
};