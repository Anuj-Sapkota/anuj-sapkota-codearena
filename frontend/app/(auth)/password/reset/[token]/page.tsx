"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authService } from "@/app/lib/services/authService";
import { toast } from "sonner";
import { isAxiosError } from "axios";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const router = useRouter();

  // State for form inputs and loading
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    try {
      // 2. Call the  authService
      // pass the token from the URL and the new password
      await authService.resetPassword(String(token), password);

      toast.success("Password changed successfully!");

      // 3. Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      {/* Container - Styled to match your Forgot Password UI */}
      <div className="bg-gray-300 w-full max-w-xl flex flex-col gap-4 py-6 px-2 rounded-md shadow-lg shadow-gray-400/20">
        <h1 className="border-b border-gray-400 pb-4 text-2xl font-semibold px-4 text-gray-800">
          Change Password
        </h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4 w-full"
        >
          <p className="text-sm text-gray-600">
            Please enter your new password below. Make sure it is secure.
          </p>

          {/* Password Field */}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full border border-gray-400 rounded-md px-4 py-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all bg-white/50"
          />

          {/* Confirm Password Field */}
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Enter Password Again"
            className="w-full border border-gray-400 rounded-md px-4 py-2 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-all bg-white/50"
          />

          {/* Reset button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full cursor-pointer bg-primary-1 hover:bg-primary-2 active:bg-primary-3 rounded-md py-2 font-semibold text-white transition-colors mt-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
