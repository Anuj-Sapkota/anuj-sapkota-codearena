import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { challengeService } from "@/lib/services/challenge.service";
import { toast } from "sonner";
import { CreateChallengeDTO } from "@/types/challenge.types";

export const useChallenges = (params: { page: number; limit?: number; search?: string }) =>
  useQuery({
    queryKey: ["challenges", "admin", params],
    queryFn: () => challengeService.getAll(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    select: (data) => ({ items: data?.data ?? [], meta: data?.meta ?? { total: 0, page: 1, pages: 1 } }),
  });

export const usePublicChallenges = () =>
  useQuery({
    queryKey: ["challenges", "public"],
    queryFn: () => challengeService.getPublic(),
    staleTime: 60_000,
    select: (data) => data?.data ?? [],
  });

export const useChallengeBySlug = (slug: string) =>
  useQuery({
    queryKey: ["challenge", slug],
    queryFn: () => challengeService.getBySlug(slug),
    enabled: !!slug,
    staleTime: 30_000,
    select: (data) => data?.data ?? data,
  });

export const useCreateChallenge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChallengeDTO) => challengeService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("CHALLENGE_CREATED");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create challenge"),
  });
};

export const useUpdateChallenge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateChallengeDTO> }) =>
      challengeService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("CHALLENGE_UPDATED");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update challenge"),
  });
};

export const useDeleteChallenge = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => challengeService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("CHALLENGE_REMOVED_SUCCESSFULLY");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete challenge"),
  });
};
