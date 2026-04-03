import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export const useBadges = () => {
  const queryClient = useQueryClient();

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => (await api.get("/badge/library")).data,
  });

  const createBadge = useMutation({
    mutationFn: async (newBadge: { name: string; description: string; iconUrl: string }) => 
      await api.post("/badge/admin/create", newBadge),
    onSuccess: () => {
      // This is the magic line: it tells React Query the 'badges' list is old
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge minted successfully!");
    },
    onError: () => {
      toast.error("Failed to save badge");
    }
  });

  const deleteBadge = useMutation({
    mutationFn: (id: string) => api.delete(`/badge/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge deleted permanentely");
    },
  });

  const updateBadge = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.put(`/badge/admin/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge updated successfully");
    },
  });

  return { badges, isLoading, deleteBadge, updateBadge, createBadge };
};
