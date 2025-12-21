"use client";
import Image from "next/image";
import Logo from "@/public/logo.png";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import Link from "next/link";

const RegisterPage = () => {
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
        <form className="flex flex-col gap-4 px-4 w-full">
          {/* Email Password Fields */}
          <input
            type="text"
            name="fullname"
            autoComplete="fullname"
            placeholder="Full Name"
            className="w-full max-w-md border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />
          <input
            type="text"
            name="Email"
            autoComplete="email"
            placeholder="Email"
            className="w-full max-w-md border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full max-w-lg border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full max-w-lg border border-gray-400 rounded-md px-4 py-2 focus:border-gray-400 focus:ring-1 focus:ring-gray-500 outline-none"
          />
          {/* For CAPTCHA */}
          <div className="w-2/3 border border-gray-400 h-16"></div>

          {/* Signup Button */}
          <button className="w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white">
            Signup
          </button>
          {/* Forgot Password and Sign in */}
          <div className="flex items-center justify-center text-gray-600">
            <p className="text-[14px]">
              Already have an account? {" "}
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

export default RegisterPage;
