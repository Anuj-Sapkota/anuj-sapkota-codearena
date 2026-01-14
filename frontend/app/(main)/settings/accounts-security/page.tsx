"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/app/lib/store/store";
import { logoutThunk } from "@/app/lib/store/features/authActions";
import { updateSocialLinks } from "@/app/lib/store/features/authSlice";
import { authService } from "@/app/lib/services/authService";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import Image from "next/image";
import { FaSpinner } from "react-icons/fa";

export default function SecuritySettings() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLink = (provider: "google" | "github") => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
  };

  const handleUnlink = async (provider: "google" | "github") => {
    if (
      confirm(`Are you sure you want to disconnect your ${provider} account?`)
    ) {
      try {
        await authService.unlinkOAuthProvider(provider);
        dispatch(updateSocialLinks({ provider, value: null }));
        toast.success(`${provider} unlinked successfully`);
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const message = err.response?.data?.error || "An error occurred";
          toast.error(message);
        } else {
          toast.error(`Failed to unlink ${provider}.`);
        }
      }
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = confirm(
      "WARNING: This is permanent. All your data will be deleted. Proceed?"
    );
    if (confirmation) {
      try {
        setIsDeleting(true);
        await authService.deleteAccountApi();
        await dispatch(logoutThunk());
        window.location.href = "/login";
      } catch (err: unknown) {
        setIsDeleting(false);
        if (isAxiosError(err)) {
          const message = err.response?.data?.error || "An error occurred";
          toast.error(message);
        } else {
          toast.error(`Failed to delete account`);
        }
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          Account & Security
        </h1>
        <p className="text-muted-foreground text-gray-500">
          Manage your connected accounts and security preferences.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold border-b pb-2">
          Connected Accounts
        </h2>

        {/* Google Row */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border border-gray-100">
              <Image
                src={GoogleLogoIcon}
                width={20}
                height={20}
                alt="google connect"
              />
            </div>
            <div>
              <p className="font-semibold text-sm">Google Account</p>
              <p
                className={`text-xs ${
                  user?.google_id ? "text-green-600" : "text-gray-400"
                }`}
              >
                {user?.google_id ? "Successfully linked" : "Not connected"}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              user?.google_id ? handleUnlink("google") : handleLink("google")
            }
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              user?.google_id
                ? "text-red-500 hover:bg-red-50 border border-transparent"
                : "bg-[#4285F4] text-white hover:bg-[#357ae8] shadow-sm"
            }`}
          >
            {user?.google_id ? "Disconnect" : "Connect Google"}
          </button>
        </div>

        {/* GitHub Row */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-white">
              <Image
                src={GitHubLogoIcon}
                width={20}
                height={20}
                alt="google connect"
              />
            </div>
            <div>
              <p className="font-semibold text-sm">GitHub Account</p>
              <p
                className={`text-xs ${
                  user?.github_id ? "text-green-600" : "text-gray-400"
                }`}
              >
                {user?.github_id ? "Successfully linked" : "Not connected"}
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              user?.github_id ? handleUnlink("github") : handleLink("github")
            }
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              user?.github_id
                ? "text-red-500 hover:bg-red-50 border border-transparent"
                : "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
            }`}
          >
            {user?.github_id ? "Disconnect" : "Connect GitHub"}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 border border-red-100 bg-red-50/50 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-600/80 leading-relaxed">
          Deleting your account is permanent. All associated data including
          profile details, settings, and progress will be wiped from our
          database.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <>
              <FaSpinner className="animate-spin" size={18} />
              Deleting...
            </>
          ) : (
            "Delete Permanently"
          )}
        </button>
      </section>
    </div>
  );
}
