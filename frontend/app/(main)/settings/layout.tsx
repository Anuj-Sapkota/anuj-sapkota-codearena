"use client";

import React from "react";
import { FiCamera } from "react-icons/fi";
import { usePathname } from "next/navigation";
import SettingsSidebar from "@/app/components/settings/SettingsSidebar";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname === "/settings/accounts-security")
      return "Account and Security";
    if (pathname === "/settings/notifications") return "Notifications";
    return "Basic";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Header Area - Added light greenish background */}
      <div className="bg-[#48855b] border-b border-green-100/50">
        <div className="pt-24 pb-20 px-12 max-w-7xl mx-auto">
          <h1 className="text-5xl font-extrabold text-gray-100 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-300 mt-4 text-lg max-w-xl">
            Manage your personal information, security preferences, and account settings.
          </p>
        </div>
      </div>

      {/* 2. Horizontal Line & Profile Picture */}
      <div className="relative border-b border-gray-200 w-full bg-white h-px">
        <div className="absolute left-[75%] -translate-x-1/2 -top-20 z-20">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full border-[8px] border-white bg-gray-100 overflow-hidden shadow-2xl shadow-gray-200">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="Profile"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            {/* Camera Overlay */}
            <div className="absolute inset-0 bg-primary-3/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
              <div className="bg-white/20 p-3 rounded-full">
                <FiCamera className="text-white" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lower Content Section */}
      <div className="flex px-12 gap-16 max-w-7xl mx-auto items-start">
        <SettingsSidebar activeTab={getActiveTab()} />
        <main className="flex-1 pt-32 pb-24 max-w-2xl">
          {children}
        </main>
      </div>
    </div>
  );
}