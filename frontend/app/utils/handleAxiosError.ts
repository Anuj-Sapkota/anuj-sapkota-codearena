import { isAxiosError } from "axios";

/**
 * Safely extracts the best possible error message without using 'any'
 */
export const handleAxiosError = (
  error: unknown,
  fallback: string = "An unexpected error occurred"
): string => {
  if (isAxiosError(error)) {
    // Check for your backend's specific error fields (message or error)
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
