import api from "../api";
import { 
  CreatorApplicationDTO, 
  VerifyOTPDTO, 
  AdminReviewDTO 
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

  // Admin: Review a pending application
  reviewApplication: async (data: AdminReviewDTO) => {
    const response = await api.patch("/creator/admin/review", data);
    return response.data;
  }
};