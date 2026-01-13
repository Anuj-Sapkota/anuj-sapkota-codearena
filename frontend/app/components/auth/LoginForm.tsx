"use client";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { yupResolver } from "@hookform/resolvers/yup";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import { useForm } from "react-hook-form";
import { AuthModalProps, LoginCredentials } from "@/app/types/auth";
import { loginSchema } from "@/app/utils/validation";
import InputField from "../common/InputField";
import { useRouter } from "next/navigation";
import TurnstileWidget from "./TurnstileWidget";
import { useDispatch } from "react-redux";
import { authService } from "@/app/lib/services/authService";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { loginThunk } from "@/app/lib/store/features/authActions";
import { AppDispatch } from "@/app/lib/store/store";

const LoginForm = ({ onSuccess, onSwitch }: AuthModalProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  //
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
      await dispatch(loginThunk(data)).unwrap();
      toast.success("Welcome back!");
      onSuccess();
      router.push("/explore");
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
      // 3. Fallback for literal strings or weird objects
      else {
        toast.error("An unexpected error occurred");
      }
    }
  };
  return (
    <>
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
            label="Email or Username"
            name="emailOrUsername"
            type="text"
            register={register("emailOrUsername")}
            errors={errors}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            register={register("password")}
            errors={errors}
          />

          {/* For CAPTCHA */}
          <div className="scale-90 origin-left">
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Forgot Password and Signup */}
        <div className="flex items-center justify-between text-gray-500 px-6 mt-2">
          <button
            onClick={() => router.push("/password/forgot")}
            className="text-sm hover:underline cursor-pointer"
          >
            Forgot password?
          </button>

          <button
            type="button"
            onClick={onSwitch}
            className="text-[15px] font-semibold text-primary-1 hover:underline cursor-pointer"
          >
            Create Account
          </button>
        </div>

        {/* Other signin Options -----------------------------------------------work to do: Make seperate component for this */}
        <div>
          <p className="text-[15px] text-gray-900 text-center mb-4">
            Or
            <br />
            Sign in with
          </p>

          <div className="flex items-center justify-center gap-8">
            <button
              onClick={() => {
                window.location.href = authService.getGoogleUrl();
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
                window.location.href = authService.getGithubUrl();
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
    </>
  );
};

export default LoginForm;
