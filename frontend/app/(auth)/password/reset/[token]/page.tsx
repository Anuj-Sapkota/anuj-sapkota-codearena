"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authService } from "@/lib/services/auth.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { PASSWORD_MIN_LENGTH } from "@/utils/constants.util";
import { FormLabel, FormInput, FormButton } from "@/components/ui/Form";

import type { ResetPasswordInput } from "@/types/user.types";

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
      await authService.resetPassword(String(token), data.password);

      toast.success("Password changed successfully! Redirecting...");

      // Short delay so user can see the success message
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      toast.error(handleAxiosError(err, "Failed to reset password"));
    }
  };

  return (
    <div className="bg-white w-full max-w-md flex flex-col gap-8 py-10 px-8 rounded-xl shadow-lg border border-gray-100">
      <header className="space-y-3">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Set New Password
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Almost there! Enter a new secure password for your account.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* New Password Field */}
        <div className="space-y-2">
          <FormLabel>New Password</FormLabel>
          <FormInput
            type="password"
            placeholder="••••••••"
            register={register("password", {
              required: "Password is required",
              minLength: {
                value: PASSWORD_MIN_LENGTH || 8,
                message: `Password must be at least ${PASSWORD_MIN_LENGTH || 8} characters`,
              },
            })}
            error={errors.password?.message}
          />
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <FormLabel>Confirm Password</FormLabel>
          <FormInput
            type="password"
            placeholder="••••••••"
            register={register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === getValues("password") || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <FormButton type="submit" isLoading={isSubmitting}>
            CHANGE PASSWORD
          </FormButton>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs font-bold text-gray-400 hover:text-primary-1 tracking-widest uppercase transition-colors text-center cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage;