import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { problemService } from "@/lib/services/problem.service";
import { toast } from "sonner";
import { CreateProblemDTO } from "@/types/problem.types";

export interface FetchProblemsParams {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: string;
  categoryIds?: number[];
  status?: string;
  userId?: number;
  sortBy?: string;
}

const toQueryParams = (p: FetchProblemsParams) => ({
  ...p,
  page: p.page || 1,
  limit: p.limit || 8,
  categoryIds: p.categoryIds?.length ? p.categoryIds.join(",") : undefined,
});

export const useProblems = (params: FetchProblemsParams) =>
  useQuery({
    queryKey: ["problems", params],
    queryFn: () => problemService.getAll(toQueryParams(params)),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

export const useProblemById = (id: string | number) =>
  useQuery({
    queryKey: ["problem", String(id)],
    queryFn: () => problemService.getById(String(id)),
    enabled: !!id,
    staleTime: 60_000,
  });

export const useCreateProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProblemDTO) => problemService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("CHALLENGE_DEPLOYED_SUCCESSFULLY");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create problem"),
  });
};

export const useUpdateProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateProblemDTO> }) =>
      problemService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      qc.invalidateQueries({ queryKey: ["problem", String(id)] });
      toast.success("CHALLENGE_UPDATED_SUCCESSFULLY");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update problem"),
  });
};

export const useDeleteProblem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => problemService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["problems"] });
      toast.success("REGISTRY_ENTRY_REMOVED");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete problem"),
  });
};
