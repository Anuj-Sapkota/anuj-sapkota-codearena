import { isAxiosError } from "axios";

// utils/axios-error.util.ts
export const handleAxiosError = (
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string => {
  if (isAxiosError(error)) {
    // 1. Check if the backend sent a specific data object
    const serverMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      (typeof error.response?.data === 'string' ? error.response.data : null);

    if (serverMessage) return serverMessage;

    // 2. If it's a 401 and we have no message, fallback usually is "Session expired"
    if (error.response?.status === 401) return "Unauthorized access. Please login.";

    return error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};