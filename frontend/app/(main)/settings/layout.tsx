"use client";

import React, { useRef } from "react";
import { FiCamera, FiLoader } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useSelector } from "react-redux";

import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { RootState } from "@/lib/store/store";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { SETTINGS_MENU_ITEMS } from "@/constants/routes";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const updateProfile = useUpdateProfile();

  const profilePic = user?.profile_pic_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.full_name || "U"}`;
  const activeId = SETTINGS_MENU_ITEMS.find((item) => item.path === pathname)?.id ?? "basic";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;
    toast.promise(
      updateProfile.mutateAsync({ userId: user.userId, file }),
      {
        loading: "Uploading...",
        success: "Profile picture updated!",
        error: (err) => err?.message || "Upload failed",
      },
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc]">

        {/* ── Top banner ── */}
        <div className="bg-slate-900 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-6 py-10 flex items-end gap-8">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <div className="w-20 h-20 rounded-sm border-2 border-slate-700 bg-slate-800 overflow-hidden relative">
                <Image src={profilePic} alt="Profile" fill className={`object-cover transition-all ${updateProfile.isPending ? "blur-sm" : ""}`} priority />
                {updateProfile.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <FiLoader className="text-white animate-spin" size={20} />
                  </div>
                )}
              </div>
              {!updateProfile.isPending && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-sm"
                >
                  <FiCamera className="text-white" size={18} />
                </button>
              )}
            </div>

            {/* Name + meta */}
            <div className="pb-1">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {user?.full_name || "Your Profile"}
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                @{user?.username} · {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-6xl mx-auto px-6 py-10 flex gap-8 items-start">
          <SettingsSidebar activeId={activeId} />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
