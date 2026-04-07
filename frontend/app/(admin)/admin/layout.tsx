"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FiMenu } from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isHydrated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user || user.role !== "ADMIN") router.replace("/");
  }, [user, isHydrated, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* Sidebar — fixed on mobile, static on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-5 shrink-0 gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <FiMenu size={18} />
          </button>
          <AdminHeader />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
