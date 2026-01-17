"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { authService } from "@/lib/services/auth.service";
import { handleAxiosError } from "@/utils/axios-error.util";
import { EMAIL_REGEX } from "@/utils/constants.util";
import { FormLabel, FormInput, FormButton } from "@/components/ui/Form"; 

import type { ForgotPasswordInput } from "@/types/user.types";

const ForgotPasswordPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>();

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await authService.requestPasswordReset(data.email);
      toast.success("Reset link sent! Please check your email.");
      router.push("/login");
    } catch (err: unknown) {
      toast.error(handleAxiosError(err, "Failed to send reset link"));
    }
  };

  return (
    <div className="bg-white w-full max-w-md flex flex-col gap-8 py-10 px-8 rounded-xl shadow-lg border border-gray-100">
      <header className="space-y-3">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Forgot Password?
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enter your email and we will send a secure link to reset your password.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-2">
          <FormLabel>Email Address</FormLabel>
          <FormInput
            type="email"
            placeholder="e.g. name@company.com"
            register={register("email", {
              required: "Email is required",
              pattern: {
                value: EMAIL_REGEX,
                message: "Please enter a valid email",
              },
            })}
            error={errors.email?.message}
          />
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <FormButton type="submit" isLoading={isSubmitting}>
            SEND RESET LINK
          </FormButton>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-xs font-bold text-gray-400 hover:text-primary-1 tracking-widest uppercase transition-colors"
          >
            ← Back to Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;