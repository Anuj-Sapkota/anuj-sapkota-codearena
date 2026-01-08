"use client";
import Image from "next/image";
import Logo from "@/public/logo.png";
import { yupResolver } from "@hookform/resolvers/yup";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { LoginCredentials } from "@/app/types/auth";
import { loginSchema } from "@/app/utils/validation";
import { login } from "@/app/lib/auth";
import InputField from "../common/InputField";
import { useRouter } from "next/navigation";
import TurnstileWidget from "../auth/TurnstileWidget";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/app/lib/store/features/authSlice";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
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
      const userData = await login(data);
      console.log(userData);
      //push data to redux
      dispatch(setCredentials({user: userData.user, token: userData.token}))
      router.push("/dashboard");
    } catch (err: unknown) {
      return err;
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          {/* Forgot Password and Signup */}
          <div className="flex items-center justify-between text-gray-600">
            <Link
              href="/password/forgot"
              className="text-sm hover:underline cursor-pointer"
            >
              Forgot password?
            </Link>
            <Link
              href="/register"
              className="text-[15px] hover:underline cursor-pointer"
            >
              Sign up
            </Link>
          </div>
        </form>
        {/* Other signin Options */}
        <div>
          <p className="text-[15px] text-gray-900 text-center mb-4">
            Or
            <br />
            Sign in with
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
    </>
  );
};

export default LoginForm;
