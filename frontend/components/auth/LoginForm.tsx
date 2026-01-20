"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";

import { loginSchema } from "@/utils/validation.util";
import { loginThunk } from "@/lib/store/features/auth/auth.actions";
import { AppDispatch } from "@/lib/store/store";

// Components
import { FormLabel, FormInput, FormButton } from "@/components/ui/Form";
import TurnstileWidget from "@/components/auth/TurnstileWidget";
import SocialAuth from "@/components/auth/SocialAuth"; // Refactored this out below

// Assets
import Logo from "@/public/logo.png";

import type { AuthModalProps, LoginCredentials } from "@/types/auth.types";
import { ROUTES } from "@/constants/routes";

const LoginForm = ({ onSuccess, onSwitch }: AuthModalProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      const user = await dispatch(loginThunk(data)).unwrap();
      toast.success("Welcome back!");
      onSuccess();
      //checking user role to redirect
      if (user.user.role === "ADMIN") {
        router.push(ROUTES.ADMIN.DASHBOAD);
      } else {
        router.push(ROUTES.MAIN.EXPLORE);
      }
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "string" ? err : "An unexpected error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-white w-full flex flex-col gap-6 py-6 px-4 rounded-xl border border-gray-100">
      {/* Logo Section */}
      <div className="flex justify-center">
        <Image
          src={Logo}
          alt="codearena logo"
          className="h-auto w-40 md:w-48"
          priority
        />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5 px-2"
      >
        {/* Email Field */}
        <div className="space-y-1.5">
          <FormLabel>Email or Username</FormLabel>
          <FormInput
            placeholder="Enter your credentials"
            register={register("emailOrUsername")}
            error={errors.emailOrUsername?.message}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <FormLabel>Password</FormLabel>
          <FormInput
            type="password"
            placeholder="••••••••"
            register={register("password")}
            error={errors.password?.message}
          />
        </div>

        {/* CAPTCHA Section */}
        <div className="scale-90 origin-left">
          <TurnstileWidget
            onVerify={(token) => setValue("turnstileToken", token)}
          />
          {errors.turnstileToken && (
            <p className="text-red-500 text-xs mt-1 ml-1 font-medium">
              Please verify you are human
            </p>
          )}
        </div>

        <FormButton type="submit" isLoading={isSubmitting}>
          LOGIN TO ACCOUNT
        </FormButton>
      </form>

      {/* Navigation Links */}
      <div className="flex items-center justify-between px-4">
        <button
          onClick={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD)}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wider transition-colors"
        >
          Forgot password?
        </button>

        <button
          type="button"
          onClick={onSwitch}
          className="text-xs font-bold text-primary-1 hover:text-primary-2 uppercase tracking-wider transition-colors cursor-pointer"
        >
          Create Account
        </button>
      </div>

      <div className="relative flex py-2 items-center px-4">
        <div className="grow border-t border-gray-200"></div>
        <span className="shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
          Or
        </span>
        <div className="grow border-t border-gray-200"></div>
      </div>

      {/* Extracted Social Auth Component */}
      <SocialAuth />
    </div>
  );
};

export default LoginForm;
