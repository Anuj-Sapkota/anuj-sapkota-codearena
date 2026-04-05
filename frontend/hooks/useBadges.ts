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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(API.BADGES.BY_ID(Number(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge removed from library");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      api.put(API.BADGES.BY_ID(Number(id)), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge updated");
    },
  });

  return { badges, isLoading, deleteMutation, updateMutation };
};
