"use client";

import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { FiLoader, FiLink, FiLink2 } from "react-icons/fi";

import GoogleLogoIcon from "@/public/google-icon.svg";
import GitHubLogoIcon from "@/public/github-icon.svg";
import { AppDispatch } from "@/lib/store/store";
import { updateSocialLinks } from "@/lib/store/features/auth/auth.slice";
import { authService } from "@/lib/services/auth.service";
import type { AuthProvider, UserProfile } from "@/types/auth.types";

const PROVIDERS = [
  { id: "google" as const, name: "Google",  icon: GoogleLogoIcon },
  { id: "github" as const, name: "GitHub",  icon: GitHubLogoIcon },
];

export const SocialConnections = ({ user }: { user: UserProfile | null }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [busy, setBusy] = useState<AuthProvider | null>(null);

  const handleConnect = (provider: AuthProvider) => {
    window.location.href = provider === "google"
      ? authService.getGoogleUrl()
      : authService.getGithubUrl();
  };

  const handleUnlink = async (provider: AuthProvider) => {
    const otherLinked = provider === "google" ? user?.github_id : user?.google_id;
    if (!user?.has_password && !otherLinked) {
      return toast.error("Set a password first to avoid getting locked out.");
    }
    if (!confirm(`Disconnect your ${provider} account?`)) return;

    try {
      setBusy(provider);
      await authService.unlinkOAuthProvider(provider);
      dispatch(updateSocialLinks({ provider, value: null }));
      toast.success(`${provider} disconnected`);
    } catch {
      toast.error(`Failed to disconnect ${provider}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-2">
      {PROVIDERS.map(({ id, name, icon }) => {
        const connected = id === "google" ? !!user?.google_id : !!user?.github_id;
        const isBusy = busy === id;

        return (
          <div key={id} className="bg-white border-2 border-slate-100 rounded-sm p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Image src={icon} width={16} height={16} alt={name} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{name}</p>
                <p className={`text-[10px] font-bold ${connected ? "text-emerald-500" : "text-slate-400"}`}>
                  {connected ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>

            <button
              disabled={isBusy}
              onClick={() => connected ? handleUnlink(id) : handleConnect(id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${
                connected
                  ? "border-2 border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-500"
                  : "bg-slate-900 text-white hover:bg-primary-1"
              }`}
            >
              {isBusy
                ? <FiLoader size={11} className="animate-spin" />
                : connected
                  ? <><FiLink2 size={10} /> Disconnect</>
                  : <><FiLink size={10} /> Connect</>}
            </button>
          </div>
        );
      })}
    </div>
  );
};
