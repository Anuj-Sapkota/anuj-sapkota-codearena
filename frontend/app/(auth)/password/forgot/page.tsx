"use client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { authService } from "@/app/lib/services/authService";
import InputField from "@/app/components/common/InputField";
import { isAxiosError } from "axios";
import { ForgotPasswordInput } from "@/app/types/userData";

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
      // Instead of an extra "done" page, we can redirect or show success state
      router.push("/login");
    } catch (err: unknown) {
      // 1. Checking if it's an Axios error
      if (isAxiosError(err)) {
        console.log("error:", err.response);
        const message = err.response?.data?.error || "An error occurred";
        toast.error(message);
      }
      // 2. Checking if it's a standard Error object
      else if (err instanceof Error) {
        toast.error(err.message);
      }
      // 3. Fallback
      else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <>
      {/* Main Card */}
      <div className="bg-white w-full max-w-md flex flex-col gap-6 py-8 px-6 rounded-xl shadow-sm border border-gray-200">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            No worries! Enter the email associated with your account and we'll
            send you a secure link to reset your password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full"
        >
          {/* Using your professional InputField component */}
          <InputField
            label="name@company.com"
            name="email"
            type="email"
            register={register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, //-------------------------make seperate constant file in future//
                message: "Invalid email address",
              },
            })}
            errors={errors}
          />

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 cursor-pointer bg-primary-1 hover:bg-primary-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all duration-200 shadow-md shadow-primary-1/20"
            >
              {isSubmitting ? "Sending Link..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors py-2"
            >
              Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
