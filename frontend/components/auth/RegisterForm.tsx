"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";

import { registerSchema } from "@/utils/validation.util";
import { registerThunk } from "@/lib/store/features/auth.actions";
import { AppDispatch } from "@/lib/store/store";
import { handleAxiosError } from "@/utils/axios-error.util";

// Professional UI Components
import { FormLabel, FormInput, FormButton } from "@/components/ui/Form";
import TurnstileWidget from "@/components/auth/TurnstileWidget";
import SocialAuth from "@/components/auth/SocialAuth";

// Assets
import Logo from "@/public/logo.png";

import type { AuthModalProps, RegisterCredentials } from "@/types/auth.types";
import { ROUTES } from "@/constants/routes";

const RegisterForm = ({ onSuccess, onSwitch }: AuthModalProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      // Logic: Yup already checked password matching/length if defined in registerSchema
      await dispatch(registerThunk(data)).unwrap();

      toast.success("Account created! Welcome to the arena.");
      onSuccess();
      router.push(ROUTES.MAIN.EXPLORE);
    } catch (err: unknown) {
      toast.error(handleAxiosError(err, "Registration failed"));
    }
  };

  return (
    <div className="bg-white w-full flex flex-col gap-6 py-6 px-4 rounded-xl border border-gray-100">
      {/* Logo */}
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
        {/* Full Name */}
        <div className="space-y-1.5">
          <FormLabel>Full Name</FormLabel>
          <FormInput
            placeholder="John Doe"
            register={register("full_name")}
            error={errors.full_name?.message}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <FormLabel>Email Address</FormLabel>
          <FormInput
            type="email"
            placeholder="name@company.com"
            register={register("email")}
            error={errors.email?.message}
          />
        </div>

        {/* Password Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FormLabel>Password</FormLabel>
            <FormInput
              type="password"
              placeholder="••••••••"
              register={register("password")}
              error={errors.password?.message}
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Confirm</FormLabel>
            <FormInput
              type="password"
              placeholder="••••••••"
              register={register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </div>
        </div>

        {/* CAPTCHA */}
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
          CREATE ACCOUNT
        </FormButton>
      </form>

      {/* Footer Links */}
      <div className="text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-primary-1 hover:text-primary-2 cursor-pointer transition-colors ml-1"
          >
            Sign in
          </button>
        </p>
      </div>

      {/* Divider */}
      <div className="relative flex py-2 items-center px-4">
        <div className="grow border-t border-gray-200"></div>
        <span className="shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">
          Or
        </span>
        <div className="grow border-t border-gray-200"></div>
      </div>

      <SocialAuth />
    </div>
  );
};

export default RegisterForm;
