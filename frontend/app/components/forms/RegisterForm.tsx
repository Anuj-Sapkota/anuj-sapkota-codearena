"use client";

import Image from "next/image";
import Logo from "@/public/logo.png";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegisterCredentials } from "@/app/types/auth";
import { useForm } from "react-hook-form";
import { signup } from "@/app/lib/api";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/app/utils/validation";
import InputField from "../common/InputField";

const  RegisterForm: React.FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      const userData = await signup(data);
      console.log(userData);
      router.push("/dashboard");
    } catch (err: unknown) {
      return err;
    }
}
    return (
      <div>
        {/* Container */}
        <div className="bg-gray-300 w-full flex flex-col gap-4 py-4 px-2 rounded-md shadow-[20px] shadow-gray-100">
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
            <div className="w-2/3 border border-gray-400 h-16"></div>

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
                <Link
                  href="/login"
                  className="text-[15px] hover:underline cursor-pointer"
                >
                  Sign in
                </Link>
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
              <Image
                src={GoogleLogoIcon}
                alt="google login"
                className="h-auto w-8 cursor-pointer hover:opacity-60 transition-all duration-250 ease-in-out"
              />
              <Image
                src={GitHubLogoIcon}
                alt="github login"
                className="h-auto w-8 cursor-pointer hover:opacity-60 transition-all duration-250 ease-in-out"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };


export default RegisterForm;
