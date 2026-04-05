"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FaBars, FaExternalLinkAlt } from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  // Show a full-screen spinner while checking auth session
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  // Prevent flash of admin content for unauthorized users
  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* 1. SIDEBAR (Mobile & Desktop) */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open Sidebar"
            >
              <FaBars size={20} />
            </button>
            
            {/* VIEW PLATFORM AS USER BUTTON 
                This allows Admins to jump straight to the student-facing side.
            */}
            <button
              onClick={() => router.push("/explore")}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-all shadow-sm group"
            >
              <FaExternalLinkAlt size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>User View</span>
            </button>
          </div>

          {/* Standard Admin Profile/Nav Header */}
          <AdminHeader />
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}