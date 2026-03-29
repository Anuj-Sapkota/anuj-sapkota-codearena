"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  useMyResources,
  useDeleteResourceMutation,
  useCreatorStats, // 🚀 Newly integrated hook
} from "@/hooks/useResource";
import {
  FiPlus,
  FiBook,
  FiLayout,
  FiActivity,
  FiLoader,
  FiVideo,
  FiArrowRight,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

export default function CreatorDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  // Data Fetching
  const { data: resources, isLoading: resourcesLoading } = useMyResources();
  const { data: stats, isLoading: statsLoading } = useCreatorStats();

  const deleteResource = useDeleteResourceMutation();

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    title: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${title}"? This will permanently remove all videos from Cloudinary.`,
    );

    if (confirmDelete) {
      deleteResource.mutate(id, {
        onSuccess: () => toast.success("Resource and assets deleted."),
        onError: (err: any) => toast.error(err.message || "Delete failed"),
      });
    }
  };

  // Authorization Guard
  if (user?.creatorStatus !== "APPROVED") {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter">
          Access Denied
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          You must be a verified creator to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">
            Creator <span className="text-primary-1">Studio</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Welcome back, {user?.full_name}. Manage your assets and earnings.
          </p>
        </div>

        <Link
          href="/creator/dashboard/create"
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all rounded-sm shadow-lg hover:-translate-y-1 active:scale-95"
        >
          <FiPlus size={16} /> Create New Resource
        </Link>
      </div>

      {/* Quick Stats - Now Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            label: "Active Resources",
            value: stats?.resourceCount ?? (resources?.length || 0),
            icon: <FiLayout />,
          },
          {
            label: "Total Earnings (80%)",
            value: stats ? `$${stats.totalEarnings.toFixed(2)}` : "$0.00",
            icon: <FiActivity />,
          },
          {
            label: "Profile Views",
            value: stats?.profileViews || 0,
            icon: <FiBook />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="border border-slate-200 p-8 bg-white rounded-sm shadow-sm hover:border-slate-300 transition-colors"
          >
            <div className="text-slate-400 mb-4">{stat.icon}</div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">
              {statsLoading ? (
                <FiLoader className="animate-spin text-slate-200" size={24} />
              ) : (
                stat.value
              )}
            </div>
            <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Resources List */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Your Marketplace
        </h2>
      </div>

      {resourcesLoading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="animate-spin text-slate-300" size={32} />
        </div>
      ) : resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((res: any) => (
            <div key={res.id} className="relative group">
              {/* ACTION BUTTONS (Edit & Delete) */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <Link
                  href={`/creator/dashboard/edit/${res.id}`}
                  className="p-2 bg-white text-slate-900 hover:bg-slate-900 hover:text-white rounded-sm shadow-xl transition-all border border-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiEdit3 size={14} />
                </Link>
                <button
                  onClick={(e) => handleDelete(e, res.id, res.title)}
                  disabled={deleteResource.isPending}
                  className="p-2 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-sm shadow-xl transition-all border border-slate-100 disabled:opacity-50"
                >
                  {deleteResource.isPending ? (
                    <FiLoader className="animate-spin" size={14} />
                  ) : (
                    <FiTrash2 size={14} />
                  )}
                </button>
              </div>

              <Link
                href={`/resource/${res.id}`}
                className="border border-slate-200 bg-white rounded-sm overflow-hidden hover:shadow-2xl hover:border-slate-900 transition-all duration-500 block relative"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={res.previewUrl}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900 text-white text-[9px] font-black uppercase px-2 py-1 tracking-widest">
                    {res.type}
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white p-3 rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <FiArrowRight className="text-slate-900" size={20} />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black uppercase text-sm tracking-tight truncate flex-1 group-hover:text-primary-1 transition-colors">
                      {res.title}
                    </h3>
                    <span className="font-bold text-sm text-emerald-600 ml-2">
                      ${res.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FiVideo size={12} />
                      <span className="text-[10px] font-bold">
                        {res._count?.modules || 0} Lessons
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                      <span
                        className={`text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full ${res.isApproved ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                      >
                        {res.isApproved ? "Live" : "Review"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-sm p-20 text-center">
          <div className="max-w-xs mx-auto">
            <FiLayout className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-black uppercase text-slate-900">
              No resources yet
            </h3>
            <p className="text-slate-500 text-xs mt-2 mb-8 font-medium">
              Start by creating your first digital product, masterclass, or
              series.
            </p>
            <Link
              href="/creator/dashboard/create"
              className="text-xs font-black uppercase underline tracking-widest hover:text-slate-900 transition-colors"
            >
              Launch Creator Wizard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
