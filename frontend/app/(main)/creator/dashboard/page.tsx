"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import { useMyResources, useDeleteResourceMutation, useCreatorStats } from "@/hooks/useResource";
import { FiPlus, FiLoader, FiVideo, FiEdit3, FiTrash2, FiEye, FiTrendingUp, FiDollarSign, FiBarChart2 } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

const npr = (val?: number | null) =>
  val ? `NPR ${val.toLocaleString()}` : "NPR 0";

export default function CreatorDashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: resources, isLoading: resourcesLoading } = useMyResources();
  const { data: stats, isLoading: statsLoading } = useCreatorStats();
  const deleteResource = useDeleteResourceMutation();

  const topResourceId = resources?.length
    ? [...resources].sort((a: any, b: any) => (b.views || 0) - (a.views || 0))[0]?.id
    : null;

  const handleDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) return;
    deleteResource.mutate(id, {
      onSuccess: () => toast.success("Resource deleted."),
      onError: (err: any) => toast.error(err.message || "Delete failed"),
    });
  };

  if (user?.role !== "CREATOR" && user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Access Denied</h2>
          <p className="text-slate-500 text-sm mt-2">Verified creators only.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Active Resources",
      value: statsLoading ? null : (stats?.resourceCount ?? resources?.length ?? 0),
      icon: <FiBarChart2 size={16} className="text-primary-1" />,
    },
    {
      label: "Total Earnings",
      value: statsLoading ? null : npr(stats?.totalEarnings),
      icon: <FiDollarSign size={16} className="text-emerald-500" />,
    },
    {
      label: "Total Views",
      value: statsLoading ? null : (stats?.totalResourceViews ?? 0),
      icon: <FiEye size={16} className="text-blue-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Banner ── */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-end justify-between gap-6">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              Creator Studio
            </h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Welcome back, {user?.full_name?.split(" ")[0]}
            </p>
          </div>
          <Link
            href={ROUTES.CREATOR.CREATE}
            className="flex items-center gap-2 bg-primary-1 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-2 transition-all active:scale-95 shrink-0"
          >
            <FiPlus size={13} /> New Resource
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white border-2 border-slate-100 rounded-sm p-5 flex items-center gap-4">
              <div className="w-9 h-9 rounded-sm bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {s.value === null
                    ? <FiLoader className="animate-spin text-slate-200" size={18} />
                    : s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Resources ── */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-5">
            Managed Content
          </p>

          {resourcesLoading ? (
            <div className="flex justify-center py-20">
              <FiLoader className="animate-spin text-slate-300" size={28} />
            </div>
          ) : resources?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res: any) => (
                <div key={res.id} className="relative group">
                  {res.id === topResourceId && (res.views || 0) > 0 && (
                    <div className="absolute -top-2.5 left-4 z-30 bg-primary-1 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                      <FiTrendingUp size={9} /> Top
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                    <Link
                      href={`/creator/dashboard/edit/${res.id}`}
                      className="p-2 bg-white text-slate-700 rounded-sm border border-slate-200 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                    >
                      <FiEdit3 size={12} />
                    </Link>
                    <button
                      onClick={(e) => handleDelete(e, res.id, res.title)}
                      className="p-2 bg-white text-rose-500 rounded-sm border border-slate-200 shadow-sm hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>

                  <Link
                    href={`/creator/dashboard/${res.id}`}
                    className="bg-white border-2 border-slate-100 rounded-sm overflow-hidden block hover:border-slate-900 transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                      {res.previewUrl
                        ? <img src={res.previewUrl} alt={res.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        : <div className="w-full h-full flex items-center justify-center"><FiVideo size={24} className="text-slate-300" /></div>}
                      <div className="absolute bottom-2 left-2 bg-white/90 text-slate-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-sm flex items-center gap-1 shadow-sm">
                        <FiEye size={9} /> {res.views || 0}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-sm ${res.isApproved ? "bg-emerald-500 text-white" : "bg-amber-400 text-white"}`}>
                          {res.isApproved ? "Live" : "Review"}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-black uppercase text-sm tracking-tight text-slate-900 truncate mb-1">
                        {res.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1 text-slate-400">
                          <FiVideo size={10} />
                          <span className="text-[10px] font-bold">{res._count?.modules || 0} lessons</span>
                        </div>
                        <span className="text-sm font-black text-emerald-600">
                          {res.price === 0 ? "FREE" : npr(res.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 py-24 text-center rounded-sm">
              <FiVideo size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-4">No resources yet</p>
              <Link
                href={ROUTES.CREATOR.CREATE}
                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-1 transition-all"
              >
                <FiPlus size={12} /> Create your first resource
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
