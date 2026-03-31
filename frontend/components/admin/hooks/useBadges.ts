import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export const useBadges = () => {
  const queryClient = useQueryClient();

  // Fetch all
  const { data: badges, isLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => (await api.get("/badge/library")).data,
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/badge/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge removed from library");
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      await api.put(`/badge/admin/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge updated");
    },
  });

  return { badges, isLoading, deleteMutation, updateMutation };
};
