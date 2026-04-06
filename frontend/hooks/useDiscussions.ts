import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { discussionService } from "@/lib/services/discussion.service";
import { toast } from "sonner";
import { CreateDiscussionDTO } from "@/types/discussion.types";

interface FetchParams {
  problemId: number;
  userId?: number;
  sortBy?: string;
  language?: string;
  search?: string;
}

export const useDiscussions = (params: FetchParams) =>
  useQuery({
    queryKey: ["discussions", params.problemId, params.sortBy, params.language, params.search],
    queryFn: () =>
      discussionService.getByProblem(
        params.problemId,
        params.userId,
        params.sortBy,
        params.language,
        params.search,
      ),
    enabled: !!params.problemId,
    staleTime: 15_000,
    select: (data) => data?.data ?? data ?? [],
  });

export const useFlaggedDiscussions = () =>
  useQuery({
    queryKey: ["discussions", "flagged"],
    queryFn: () => discussionService.getFlagged(),
    staleTime: 30_000,
    select: (data) => data?.data ?? data ?? [],
  });

const invalidateDiscussions = (qc: ReturnType<typeof useQueryClient>, problemId: number) =>
  qc.invalidateQueries({ queryKey: ["discussions", problemId] });

export const useCreateDiscussion = (problemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscussionDTO) => discussionService.create(data),
    onSuccess: () => invalidateDiscussions(qc, problemId),
    onError: (err: any) => toast.error(err.message || "Failed to post"),
  });
};

export const useUpdateDiscussion = (problemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateDiscussionDTO> }) =>
      discussionService.update(id, data),
    onSuccess: () => invalidateDiscussions(qc, problemId),
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });
};

export const useDeleteDiscussion = (problemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discussionService.delete(id),
    onSuccess: () => invalidateDiscussions(qc, problemId),
    onError: (err: any) => toast.error(err.message || "Failed to delete"),
  });
};

export const useToggleUpvote = (problemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discussionService.toggleUpvote(id),
    // Optimistic update — flip hasUpvoted and adjust count immediately
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: ["discussions", problemId] });
      const prev = qc.getQueriesData({ queryKey: ["discussions", problemId] });

      qc.setQueriesData({ queryKey: ["discussions", problemId] }, (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map((d: any) => {
          if (d.id === id) {
            return {
              ...d,
              hasUpvoted: !d.hasUpvoted,
              upvotes: d.hasUpvoted ? d.upvotes - 1 : d.upvotes + 1,
            };
          }
          // also check replies
          return {
            ...d,
            replies: (d.replies || []).map((r: any) =>
              r.id === id
                ? { ...r, hasUpvoted: !r.hasUpvoted, upvotes: r.hasUpvoted ? r.upvotes - 1 : r.upvotes + 1 }
                : r,
            ),
          };
        });
      });

      return { prev };
    },
    onError: (_err, _id, ctx) => {
      // Roll back on failure
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => qc.setQueryData(key, val));
      }
    },
    onSettled: () => invalidateDiscussions(qc, problemId),
  });
};

export const useReportDiscussion = (problemId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, type, details }: { id: string; type: string; details: string }) =>
      discussionService.report(id, type, details),
    onSuccess: () => {
      invalidateDiscussions(qc, problemId);
      toast.success("Report submitted");
    },
    onError: (err: any) => {
      if (err.response?.status === 409) toast.error("Already reported");
      else toast.error(err.message || "Report failed");
    },
  });
};

export const useModerateDiscussion = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "BLOCK" | "UNBLOCK" }) =>
      discussionService.moderate(id, action),
    onSuccess: (_, { action }) => {
      qc.invalidateQueries({ queryKey: ["discussions"] });
      toast.success(`Discussion ${action === "BLOCK" ? "blocked" : "unblocked"}`);
    },
    onError: (err: any) => toast.error(err.message || "Moderation failed"),
  });
};
