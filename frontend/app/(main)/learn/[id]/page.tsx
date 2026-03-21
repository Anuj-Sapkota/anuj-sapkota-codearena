"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiPlay,
  FiCheckCircle,
  FiLoader,
  FiClock,
  FiLayers,
  FiChevronRight,
} from "react-icons/fi";
import Link from "next/link";
import api from "@/lib/api";

export default function LearnPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);

  // Use React Query to fetch the resource (this will pick up the 'isOwned' flag)
  const {
    data: resource,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["resource", id],
    queryFn: async () => {
      const res = await api.get(`/resources/${id}`);
      return res.data;
    },
  });

  // Security Redirect: If the user doesn't own it, send them back to the sales page
  useEffect(() => {
    if (!isLoading && resource && !resource.isOwned) {
      router.replace(`/resources/${id}`);
    }
  }, [resource, isLoading, id, router]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <FiLoader className="animate-spin text-slate-900" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
          Initializing Classroom
        </p>
      </div>
    );

  if (error || !resource)
    return (
      <div className="h-screen flex items-center justify-center text-center p-20">
        <div>
          <h2 className="font-black uppercase italic text-2xl tracking-tighter">
            Uplink Failed
          </h2>
          <Link
            href="/dashboard"
            className="text-[10px] font-bold uppercase tracking-widest underline mt-4 block text-slate-400 hover:text-black"
          >
            Return to Base
          </Link>
        </div>
      </div>
    );

  const currentModule = resource.modules[activeModuleIdx];

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* 1. Classroom Header */}
      <header className="border-b border-slate-100 px-8 py-4 flex items-center justify-between bg-white z-20">
        <div className="flex items-center gap-6">
          <Link
            href={`/resources/${id}`}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">
                Access Active
              </span>
              <FiChevronRight size={10} className="text-slate-300" />
              <h1 className="text-xs font-black uppercase tracking-tighter italic text-slate-900">
                {resource.title}
              </h1>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {activeModuleIdx + 1} of {resource.modules.length} •{" "}
              {currentModule?.title}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1">
        {/* 2. Cinema Video Stage */}
        <main className="flex-1 bg-slate-950 flex items-center justify-center relative group">
          {currentModule?.contentUrl ? (
            <div className="w-full h-full max-w-6xl mx-auto flex items-center justify-center p-4 lg:p-12">
              <video
                key={currentModule.contentUrl} // Forces re-render on module change
                src={currentModule.contentUrl}
                controls
                className="w-full h-full shadow-2xl rounded-xl border border-white/5"
                autoPlay
              />
            </div>
          ) : (
            <div className="text-slate-600 text-center">
              <FiLayers
                size={48}
                className="mx-auto mb-4 opacity-20 text-white"
              />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Encrypted Content Unavailable
              </p>
            </div>
          )}
        </main>

        {/* 3. Playlist Sidebar */}
        <aside className="w-full lg:w-[400px] border-l border-slate-100 h-[calc(100vh-69px)] overflow-y-auto bg-white">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">
              Classroom Syllabus
            </h3>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-4">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000"
                style={{
                  width: `${((activeModuleIdx + 1) / resource.modules.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {resource.modules.map((module: any, index: number) => {
              const isActive = activeModuleIdx === index;
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModuleIdx(index)}
                  className={`w-full flex items-start gap-5 p-8 transition-all text-left group ${
                    isActive
                      ? "bg-slate-50 border-r-4 border-r-slate-900"
                      : "hover:bg-slate-50/50"
                  }`}
                >
                  <div
                    className={`mt-1 flex-shrink-0 transition-colors ${isActive ? "text-slate-900" : "text-slate-300"}`}
                  >
                    {isActive ? (
                      <FiPlay size={16} className="fill-current" />
                    ) : (
                      <FiCheckCircle size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-xs font-black uppercase italic leading-tight mb-2 tracking-tight ${
                        isActive
                          ? "text-slate-900"
                          : "text-slate-500 group-hover:text-slate-700"
                      }`}
                    >
                      {module.title}
                    </p>
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className={isActive ? "text-slate-900" : ""}>
                        Part {index + 1}
                      </span>
                      <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                        <FiClock size={10} /> Stream
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
