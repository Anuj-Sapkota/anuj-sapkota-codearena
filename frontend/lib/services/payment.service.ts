// lib/services/payment.service.ts
import api from "@/lib/api";

export const paymentService = {
  // 1. Get the signed data from our backend
  initiateEsewa: async (resourceId: string) => {
    const { data } = await api.post("/payments/initiate-esewa", { resourceId });
    return data;
  },

  // 2. Verify the payment after eSewa redirect
  verifyEsewa: async (encodedData: string) => {
    const { data } = await api.post("/payments/verify-esewa", { encodedData });
    return data;
  },
};
