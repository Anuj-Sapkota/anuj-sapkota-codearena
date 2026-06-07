import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { API } from "@/constants/api.constants";
import { toast } from "sonner";

export const useBadges = () => {
  const queryClient = useQueryClient();

  const { data: badges, isLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => (await api.get(API.BADGES.BASE)).data,
  });

  const createBadge = useMutation({
    mutationFn: async (data: { name: string; description: string; iconUrl: string }) =>
      api.post(API.BADGES.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge created");
    },
    onError: () => toast.error("Failed to create badge"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      api.put(API.BADGES.BY_ID(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge updated");
    },
    onError: () => toast.error("Failed to update badge"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(API.BADGES.BY_ID(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge removed");
    },
    onError: () => toast.error("Failed to delete badge"),
  });

  return { badges, isLoading, createBadge, updateMutation, deleteMutation };
};
