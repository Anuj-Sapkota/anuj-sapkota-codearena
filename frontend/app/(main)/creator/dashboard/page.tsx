"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import {
  useMyResources,
  useDeleteResourceMutation,
  useCreatorStats,
} from "@/hooks/useResource";
import {
  FiPlus,
  FiLayout,
  FiActivity,
  FiLoader,
  FiVideo,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiTrendingUp,
} from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

export default function CreatorDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);

  const { data: resources, isLoading: resourcesLoading } = useMyResources();
  const { data: stats, isLoading: statsLoading } = useCreatorStats();
  const deleteResource = useDeleteResourceMutation();

  // Logic to find the ID of the resource with the most views
  const topResourceId = resources?.length
    ? [...resources].sort((a, b) => (b.views || 0) - (a.views || 0))[0]?.id
    : null;

  const handleDelete = async (
    e: React.MouseEvent,
    id: string,
    title: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteResource.mutate(id, {
        onSuccess: () => toast.success("Resource deleted."),
        onError: (err: any) => toast.error(err.message || "Delete failed"),
      });
    }
  };

  if (user?.creatorStatus !== "APPROVED") {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">
          Access Denied
        </h2>
        <p className="text-slate-500 text-sm mt-2">Verified creators only.</p>
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
            Welcome back, {user?.full_name.split(" ")[0]}.
          </p>
        </div>

        <Link
          href="/creator/dashboard/create"
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg hover:bg-slate-800 transition-all"
        >
          <FiPlus size={16} /> Create New Resource
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          {
            label: "Active Resources",
            value: stats?.resourceCount ?? (resources?.length || 0),
            icon: <FiLayout />,
          },
          {
            label: "Total Earnings (NPR)",
            value: user?.totalEarnings
              ? `NPR ${user.totalEarnings.toLocaleString()}`
              : stats?.totalEarnings
                ? `NPR ${stats.totalEarnings.toLocaleString()}`
                : "NPR 0",
            icon: <FiActivity />,
          },
          {
            label: "Total Resource Views",
            value: stats?.totalResourceViews || 0,
            icon: <FiEye />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="border border-slate-200 p-8 bg-white rounded-sm shadow-sm"
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

      {/* Resources Grid */}
      <div className="mb-6">
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Managed Content
        </h2>
      </div>

      {resourcesLoading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="animate-spin text-slate-300" size={32} />
        </div>
      ) : resources?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((res: any) => (
            <div key={res.id} className="relative group">
              {/* Top Performer Badge */}
              {res.id === topResourceId && (res.views || 0) > 0 && (
                <div className="absolute -top-3 left-4 z-30 bg-primary-1 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-xl flex items-center gap-1">
                  <FiTrendingUp size={10} /> Top Performer
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <Link
                  href={`/creator/dashboard/edit/${res.id}`}
                  className="p-2 bg-white text-slate-900 rounded-sm border shadow-sm hover:bg-slate-900 hover:text-white"
                >
                  <FiEdit3 size={14} />
                </Link>
                <button
                  onClick={(e) => handleDelete(e, res.id, res.title)}
                  className="p-2 bg-white text-rose-500 rounded-sm border shadow-sm hover:bg-rose-500 hover:text-white"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              <Link
                href={`/resource/${res.id}`}
                className="border border-slate-200 bg-white rounded-sm overflow-hidden block hover:border-slate-900 transition-all duration-500"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={res.previewUrl}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-black uppercase px-2 py-1 rounded-sm flex items-center gap-1 shadow-sm">
                    <FiEye size={10} /> {res.views || 0}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black uppercase text-sm tracking-tight truncate flex-1 pr-2">
                      {res.title}
                    </h3>
                    <span className="font-bold text-sm text-emerald-600 shrink-0">
                      NPR {res.price?.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FiVideo size={12} />
                      <span className="text-[10px] font-bold">
                        {res._count?.modules || 0} Lessons
                      </span>
                    </div>
                    <div className="ml-auto">
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
        <div className="border-2 border-dashed border-slate-200 p-20 text-center rounded-sm">
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">
            No resources found.
          </p>
        </div>
      )}
    </div>
  );
}
