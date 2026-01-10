"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authService } from "@/app/lib/services/authService";
import InputField from "@/app/components/common/InputField";
import { isAxiosError } from "axios";
import { ResetPasswordInput } from "@/app/types/userData"; // Ensure this type exists

const ResetPasswordPage = () => {
  const { token } = useParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>();

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      // Calling the backend with the token from the URL and new password
      await authService.resetPassword(String(token), data.password);

      toast.success("Password changed successfully! Redirecting...");

      // Redirect to login after success
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.error || "An error occurred";
        toast.error(message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      {/* Main Card - Styled exactly like Forgot Password */}
      <div className="bg-white w-full max-w-md flex flex-col gap-6 py-8 px-6 rounded-xl shadow-sm border border-gray-200">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Almost there! Enter a new secure password for your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full"
        >
          {/* New Password Field */}
          <InputField
            label="New Password"
            name="password"
            type="password"
            register={register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            errors={errors}
          />

          {/* Confirm Password Field */}
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                // Change watch to getValues
                value === getValues("password") || "Passwords do not match",
            })}
            errors={errors}
          />

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 cursor-pointer bg-primary-1 hover:bg-primary-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 shadow-md shadow-primary-1/20"
            >
              {isSubmitting ? "Updating Password..." : "Change Password"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors py-2 text-center"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordPage;
