import { useState } from "react";
import { userService } from "@/lib/services/user.service";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeUpdate = async (userId: number, data: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await userService.updateProfile(userId, data);
      return result;
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        console.log("error:", err.response);
        const message = err.response?.data?.error || "An error occurred";
        toast.error(message);
      }
      // 2. Checking if it's a standard Error object
      else if (err instanceof Error) {
        toast.error(err.message);
      }
      // 3. Fallback for literal strings or weird objects
      else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return { executeUpdate, isLoading, error };
};
