"use client";

import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { FaSpinner } from "react-icons/fa";

import config from "@/config";
import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import { AppDispatch } from "@/lib/store/store";
import { updateSocialLinks } from "@/lib/store/features/auth.slice";
import { authService } from "@/lib/services/auth.service";

import type { AuthProvider, UserProfile } from "@/types/auth.types";
import { API_ROUTES } from "@/constants/routes";

export const SocialConnections = ({ user }: { user: UserProfile | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [busyProvider, setBusyProvider] = useState<AuthProvider | null>(null);

  const handleConnect = (provider: AuthProvider) => {
    // Redirects to backend Passport route
    window.location.href = API_ROUTES.AUTH.SOCIAL(provider);
  };

  const handleUnlink = async (provider: AuthProvider) => {
    // Safety check: Don't let users lock themselves out
    const otherProviderLinked =
      provider === "google" ? user?.github_id : user?.google_id;
    if (!user?.has_password && !otherProviderLinked) {
      return toast.error(
        "Please set a password first to avoid getting locked out."
      );
    }

    if (confirm(`Are you sure you want to disconnect ${provider}?`)) {
      try {
        setBusyProvider(provider);
        await authService.unlinkOAuthProvider(provider);
        dispatch(updateSocialLinks({ provider, value: null }));
        toast.success(`${provider} account unlinked successfully`);
      } catch (err) {
        console.log(err);
        toast.error(`Failed to unlink ${provider}`);
      } finally {
        setBusyProvider(null);
      }
    }
  };

  const providers = [
    {
      id: "google" as const,
      name: "Google",
      icon: GoogleLogoIcon,
      val: user?.google_id,
    },
    {
      id: "github" as const,
      name: "GitHub",
      icon: GitHubLogoIcon,
      val: user?.github_id,
    },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2 text-gray-800">
        Connected Accounts
      </h2>
      {providers.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 border">
              <Image src={item.icon} width={20} height={20} alt={item.name} />
            </div>
            <div className="flex flex-col text-sm">
              <span className="font-semibold">{item.name} Account</span>
              <span className={item.val ? "text-green-600" : "text-gray-400"}>
                {item.val ? "Connected" : "Not linked"}
              </span>
            </div>
          </div>
          <button
            disabled={busyProvider === item.id}
            onClick={() =>
              item.val ? handleUnlink(item.id) : handleConnect(item.id)
            }
            className={`min-w-[110px] px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              item.val
                ? "text-red-500 hover:bg-red-50"
                : "bg-gray-900 text-white hover:bg-gray-800"
            }`}
          >
            {busyProvider === item.id ? (
              <FaSpinner className="animate-spin mx-auto" />
            ) : item.val ? (
              "Disconnect"
            ) : (
              "Connect"
            )}
          </button>
        </div>
      ))}
    </section>
  );
};
