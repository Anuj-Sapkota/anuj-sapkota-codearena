import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { creatorService } from "@/lib/services/creator.service";
import { toast } from "sonner";
import { CreatorApplicationDTO, VerifyOTPDTO, AdminReviewDTO } from "@/types/creator.types";

export const usePendingApplications = () =>
  useQuery({
    queryKey: ["creator", "pending"],
    queryFn: () => creatorService.fetchPendingApplications(),
    staleTime: 30_000,
    select: (data) => data?.data ?? [],
  });

export const useApplyCreator = () =>
  useMutation({
    mutationFn: (data: CreatorApplicationDTO) => creatorService.apply(data),
    onError: (err: any) => toast.error(err.message || "Application failed"),
  });

export const useVerifyCreatorOTP = () =>
  useMutation({
    mutationFn: (data: VerifyOTPDTO) => creatorService.verifyOTP(data),
    onError: (err: any) => toast.error(err.message || "OTP verification failed"),
  });

export const useReviewApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminReviewDTO) => creatorService.reviewApplication(data),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["creator", "pending"] });
      toast.success(`Application ${status === "APPROVED" ? "approved" : "rejected"} successfully`);
    },
    onError: (err: any) => toast.error(err.message || "Review failed"),
  });
};
