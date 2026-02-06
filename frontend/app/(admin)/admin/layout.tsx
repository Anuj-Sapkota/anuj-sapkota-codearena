"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/lib/store/store";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { FaBars } from "react-icons/fa";
import { fetchCategoriesThunk } from "@/lib/store/features/category/category.actions";
import { fetchProblemsThunk } from "@/lib/store/features/problems/problem.actions"; // Import this

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  /**
   * GLOBAL ADMIN DATA FETCHING
   * These run once whenever the admin section is accessed or refreshed.
   * This ensures that modals for Challenges/Contests always have the 
   * global registries ready to go.
   */
  useEffect(() => {
    // Fetch Categories for the whole admin panel
    dispatch(fetchCategoriesThunk());
    
    // Fetch Problems repository (Increase limit to ensure you get enough for selection)
    dispatch(fetchProblemsThunk({ page: 1, limit: 100 }));
  }, [dispatch]);

  if (isLoading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar Container */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Backdrop for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-slate-600 md:hidden hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FaBars size={20} />
          </button>
          <AdminHeader />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}