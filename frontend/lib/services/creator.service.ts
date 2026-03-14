import api from "../api";
import {
  CreatorApplicationDTO,
  VerifyOTPDTO,
  AdminReviewDTO,
} from "@/types/creator.types";

export const creatorService = {
  // User: Submit initial application (triggers email OTP)
  apply: async (data: CreatorApplicationDTO) => {
    const response = await api.post("/creator/apply", data);
    return response.data;
  },

  // User: Verify the OTP sent to email
  verifyOTP: async (data: VerifyOTPDTO) => {
    const response = await api.post("/creator/verify", data);
    return response.data;
  },

  // Admin: Fetch all pending applications
  // Updated to use your 'api' instance and correct endpoint
  fetchPendingApplications: async () => {
    const response = await api.get("/creator/pending-creators");
    return response.data; // { success: true, data: [...] }
  },

  // Admin: Review a pending application
  reviewApplication: async (data: AdminReviewDTO) => {
    // Note: Ensure this matches your backend route: "/admin/review-creator"
    const response = await api.patch("/creator/review-creator", data);
    return response.data;
  },
};
