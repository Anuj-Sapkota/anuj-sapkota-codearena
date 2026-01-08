"use client";

import Image from "next/image";
import Logo from "@/public/logo.png";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthModalProps, RegisterCredentials } from "@/app/types/auth";
import { useForm } from "react-hook-form";
import { signup } from "@/app/lib/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/app/utils/validation";
import InputField from "../common/InputField";
import TurnstileWidget from "./TurnstileWidget";

const RegisterForm = ({ onSuccess, onSwitch }: AuthModalProps) => {
  const router = useRouter();

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
      const userData = await signup(data);
      console.log(userData);
      onSuccess();
      router.push("/dashboard");
    } catch (err: unknown) {
      return err;
    }
  };
  return (
    <div>
      {/* Container */}
      <div className="bg-white w-full flex flex-col gap-4 py-4 px-2 rounded-md shadow-[20px] shadow-gray-100">
        {/* logo */}
        <div className="mb-6 lg:mb-4">
          <Image
            src={Logo}
            alt="codearena logo"
            className="h-auto mx-auto w-38 md:w-48 lg:w-56"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-4 w-full"
        >
          {/* Email Password Fields */}
          <InputField
            label="Full Name"
            name="full_name"
            type="text"
            register={register("full_name")}
            errors={errors}
          />

          <InputField
            label="Email"
            name="email"
            type="text"
            register={register("email")}
            errors={errors}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            register={register("password")}
            errors={errors}
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            register={register("confirmPassword")}
            errors={errors}
          />

          {/* For CAPTCHA */}
          <div className="origin-left scale-90">
            <TurnstileWidget
              onVerify={(token) => {
                setValue("turnstileToken", token);
              }}
            />
            {errors.turnstileToken && (
              <p className="text-red-500 text-sm">
                Please verify you are human
              </p>
            )}
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white"
          >
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
          {/* Forgot Password and Sign in */}
          <div className="flex items-center justify-center text-gray-600">
            <p className="text-[14px]">
              Already have an account?{" "}
              <button
                type="button" // Important: set type to button so it doesn't submit the form
                onClick={onSwitch}
                className="text-[15px] text-primary-1 font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
        {/* Other sign up Options */}
        <div>
          <p className="text-[15px] text-gray-900 text-center mb-4">
            Or
            <br />
            Sign up with
          </p>

          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => {
                window.location.href = "http://localhost:5000/api/auth/google";
              }}
            >
              <Image
                src={GoogleLogoIcon}
                alt="google login"
                className="h-auto w-8 cursor-pointer hover:opacity-60 transition-all duration-250 ease-in-out"
              />
            </button>
            <button
              onClick={() => {
                window.location.href = "http://localhost:5000/api/auth/github";
              }}
            >
              <Image
                src={GitHubLogoIcon}
                alt="github login"
                className="h-auto w-8 cursor-pointer hover:opacity-60 transition-all duration-250 ease-in-out"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
