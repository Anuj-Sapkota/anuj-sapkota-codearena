"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useResourceById } from "@/hooks/useResource";
// 🚀 Using your custom API instance to handle cookies/auth automatically
import api from "@/lib/api";
import {
  FiArrowLeft,
  FiPlay,
  FiCheckCircle,
  FiLoader,
  FiLayers,
  FiMenu,
  FiX,
} from "react-icons/fi";
import Link from "next/link";

export default function ResourcePlayerPage() {
  const { id } = useParams();
  const { data: resource, isLoading, error } = useResourceById(id as string);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 🚀 YouTube-style View Tracking State
  const hasTrackedView = useRef(false);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        <FiLoader className="animate-spin text-white/20" size={40} />
      </div>
    );

  if (error || !resource)
    return (
      <div className="h-screen flex items-center justify-center bg-white p-10 text-center">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter">
            Resource Not Found
          </h2>
          <Link
            href="/dashboard"
            className="text-[10px] font-bold uppercase mt-4 block text-slate-400 underline"
          >
            Return to Learning
          </Link>
        </div>
      </div>
    );

  const currentModule = resource.modules[activeModuleIdx];

  // 🚀 Handle View Logic
  const handleVideoTimeUpdate = (e: any) => {
    const currentTime = e.target.currentTime;

    // Trigger sync after 5 seconds of watch time
    if (currentTime > 5 && !hasTrackedView.current) {
      hasTrackedView.current = true;

      // Using your 'api' instance which already has baseURL and withCredentials
      api
        .patch(`/resources/${id}/view`)
        .then(() => {
          console.log("✅ View Count Synchronized");
        })
        .catch((err) => {
          console.error(
            "❌ View Sync Failed:",
            err.response?.data || err.message,
          );
          // Reset only if it wasn't an auth error, to allow retry on network gltiches
          if (err.response?.status !== 401) {
            hasTrackedView.current = false;
          }
        });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* HEADER */}
      <header className="h-[65px] border-b border-slate-100 px-6 flex items-center justify-between bg-white shrink-0 z-30">
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/dashboard"
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="border-l border-slate-100 pl-4 lg:pl-6">
            <h1 className="text-[11px] lg:text-sm font-black uppercase tracking-tighter italic text-slate-900 leading-none truncate max-w-[200px] md:max-w-none">
              {resource.title}
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
              Chapter {activeModuleIdx + 1}: {currentModule?.title}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 text-slate-900"
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* PLAYER AREA */}
        <main className="flex-1 bg-[#050505] overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto p-4 lg:p-10">
            {currentModule?.contentUrl ? (
              <div className="animate-in fade-in duration-500">
                <div className="w-full aspect-video bg-black rounded-sm overflow-hidden shadow-2xl border border-white/5">
                  <video
                    key={currentModule.id} // Forces re-render on module change
                    src={currentModule.contentUrl}
                    controls
                    onTimeUpdate={handleVideoTimeUpdate}
                    className="w-full h-full object-contain"
                    autoPlay
                    controlsList="nodownload"
                  />
                </div>

                <div className="mt-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-white text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
                      Now Playing
                    </span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      Part {activeModuleIdx + 1}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-4xl font-black uppercase italic tracking-tighter mb-4">
                    {currentModule?.title}
                  </h2>
                  <div className="h-px w-full bg-white/10 mb-6" />
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                    You are watching {resource.title}. Complete all modules to
                    finish the series.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-white/5">
                <FiLayers size={64} className="mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                  Content Unavailable
                </p>
                <p className="text-[9px] font-bold mt-2 uppercase">
                  Check your purchase status or creator permissions
                </p>
              </div>
            )}
          </div>
        </main>

        {/* SIDEBAR */}
        <aside
          className={`
          fixed inset-0 z-20 lg:relative lg:translate-x-0 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          w-full lg:w-[380px] border-l border-slate-100 bg-white overflow-y-auto
        `}
        >
          <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Course Content
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {resource.modules.map((module: any, index: number) => (
              <button
                key={module.id}
                onClick={() => {
                  setActiveModuleIdx(index);
                  setIsSidebarOpen(false);
                  // Reset tracking when switching modules so we can track views per video
                  hasTrackedView.current = false;
                }}
                className={`w-full flex items-start gap-4 p-6 transition-all text-left ${
                  activeModuleIdx === index
                    ? "bg-slate-50 border-l-4 border-l-slate-900"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`mt-1 ${activeModuleIdx === index ? "text-slate-900" : "text-slate-200"}`}
                >
                  {activeModuleIdx === index ? (
                    <FiPlay size={14} />
                  ) : (
                    <FiCheckCircle size={14} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[11px] font-black uppercase italic leading-tight truncate ${activeModuleIdx === index ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {module.title}
                  </p>
                  <p className="text-[9px] font-bold text-slate-300 uppercase mt-2 tracking-widest">
                    Part {index + 1} • Video
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
