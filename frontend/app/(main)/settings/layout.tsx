"use client";

import React, { useRef } from "react";
import { FiCamera, FiLoader } from "react-icons/fi";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import { AppDispatch, RootState } from "@/lib/store/store";
import { updateThunk } from "@/lib/store/features/auth.actions";
import { useDispatch, useSelector } from "react-redux";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  
  // 1. Get user and loading state from Redux
  const { user, isLoading } = useSelector((state:RootState) => state.auth);

  // Fallback if user isn't loaded yet
  const profilePic = user?.profile_pic_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix";

  const getActiveTab = () => {
    if (pathname === "/settings/accounts-security") return "Account and Security";
    if (pathname === "/settings/notifications") return "Notifications";
    return "Basic";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;

    const formData = new FormData();
    formData.append("profile_pic", file);

    // 2. Use Sonner toast with the Redux Thunk
    const promise = dispatch(updateThunk({ userId: user.userId, data: formData })).unwrap();

    toast.promise(promise, {
      loading: "Uploading your new look...",
      success: "Profile picture updated!",
      error: (err) => err || "Failed to upload image",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-[#48855b] border-b border-green-100/50">
          <div className="pt-24 pb-20 px-12 max-w-7xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold text-gray-100 tracking-tight"
            >
              Settings
            </motion.h1>
            <p className="text-slate-300 mt-4 text-lg max-w-xl">
              Manage your personal information, security preferences, and account settings.
            </p>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="relative border-b border-gray-200 w-full bg-white h-px">
          <div className="absolute left-[75%] -translate-x-1/2 -top-20 z-20">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* Avatar Container */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="w-40 h-40 rounded-full border-8 border-white bg-gray-100 overflow-hidden shadow-2xl relative"
              >
                <Image
                  src={profilePic}
                  alt="Profile"
                  fill
                  className={`object-cover transition-all duration-500 group-hover:scale-110 ${isLoading ? 'blur-sm grayscale' : ''}`}
                  priority
                />

                {/* Loading Spinner Overlay */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20"
                    >
                      <FiLoader className="text-white animate-spin" size={30} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Camera Button Overlay */}
              {!isLoading && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]"
                >
                  <div className="bg-white/20 p-3 rounded-full">
                    <FiCamera className="text-white" size={32} />
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Layout Body */}
        <div className="flex px-12 gap-16 max-w-7xl mx-auto items-start">
          <SettingsSidebar activeTab={getActiveTab()} />
          <motion.main 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1 pt-32 pb-24 max-w-2xl"
          >
            {children}
          </motion.main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 