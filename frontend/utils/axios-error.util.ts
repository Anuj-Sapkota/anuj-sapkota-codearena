import { isAxiosError } from "axios";

export const handleAxiosError = (
  error: unknown,
  fallback: string = "An unexpected error occurred",
): string => {
  if (isAxiosError(error)) {
    // Check nested structures
    const data = error.response?.data;

    const serverMessage =
      data?.error || // Your current backend structure
      data?.message || // Common alternative
      (Array.isArray(data?.errors) ? data.errors[0].msg : null) || // express-validator style
      (typeof data === "string" ? data : null);

    if (serverMessage) return serverMessage;

    if (error.response?.status === 401)
      return "Unauthorized access. Please login.";
    if (error.response?.status === 404) return "Requested resource not found.";

    return error.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
};
