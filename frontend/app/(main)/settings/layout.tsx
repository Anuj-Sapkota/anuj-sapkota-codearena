"use client";

import React, { useState, useRef } from "react";
import { FiCamera } from "react-icons/fi";
import { usePathname } from "next/navigation";
import SettingsSidebar from "@/app/components/settings/SettingsSidebar";
import { useUpdateProfile } from "@/app/hooks/useProfileUpdate";
import Image from "next/image";
import ProtectedRoute from "@/app/components/layout/ProtectedRoute";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { executeUpdate, isLoading } = useUpdateProfile();

  // Local state for immediate UI feedback
  const [previewUrl, setPreviewUrl] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  );

  const getActiveTab = () => {
    if (pathname === "/settings/accounts-security")
      return "Account and Security";
    if (pathname === "/settings/notifications") return "Notifications";
    return "Basic";
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Show instant preview
    setPreviewUrl(URL.createObjectURL(file));

    // 2. Upload immediately (Professional UX)
    const formData = new FormData();
    formData.append("profile_pic", file);

    try {
      // Hardcoded ID 13 for now
      await executeUpdate(13, formData);
      alert("Profile picture updated!");
    } catch (err) {
      alert("Failed to upload image");
    }
  };

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#48855b] border-b border-green-100/50">
        <div className="pt-24 pb-20 px-12 max-w-7xl mx-auto">
          <h1 className="text-5xl font-extrabold text-gray-100 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-300 mt-4 text-lg max-w-xl">
            Manage your personal information, security preferences, and account
            settings.
          </p>
        </div>
      </div>

      <div className="relative border-b border-gray-200 w-full bg-white h-px">
        <div className="absolute left-[75%] -translate-x-1/2 -top-20 z-20">
          <div className="relative group">
            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div
              className={`w-40 h-40 rounded-full border-8 border-white bg-gray-100 overflow-hidden shadow-2xl transition-opacity ${
                isLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <Image
                src={previewUrl}
                alt="Profile Picture"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                priority // Loads the image immediately as it's above the fold
                sizes="160px"
              />
            </div>

            {/* Camera Overlay */}
            <button
              onClick={handleImageClick}
              disabled={isLoading}
              className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]"
            >
              <div className="bg-white/20 p-3 rounded-full">
                <FiCamera className="text-white" size={32} />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex px-12 gap-16 max-w-7xl mx-auto items-start">
        <SettingsSidebar activeTab={getActiveTab()} />
        <main className="flex-1 pt-32 pb-24 max-w-2xl">{children}</main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
