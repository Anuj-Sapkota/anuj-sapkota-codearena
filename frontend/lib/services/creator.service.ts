import api from "@/lib/api";
import { API } from "@/constants/api.constants";
import { CreatorApplicationDTO, VerifyOTPDTO, AdminReviewDTO } from "@/types/creator.types";

export const creatorService = {
  apply: async (data: CreatorApplicationDTO) => {
    const response = await api.post(API.CREATOR.APPLY, data);
    return response.data;
  },

  verifyOTP: async (data: VerifyOTPDTO) => {
    const response = await api.post(API.CREATOR.VERIFY_OTP, data);
    return response.data;
  },

  fetchPendingApplications: async () => {
    const response = await api.get(API.CREATOR.APPLICATIONS);
    return response.data;
  },

  reviewApplication: async (data: AdminReviewDTO) => {
    const response = await api.patch("/creator/admin/review", data);
    return response.data;
  },
};
