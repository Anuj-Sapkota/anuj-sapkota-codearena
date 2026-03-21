"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useResourceById } from "@/hooks/useResource";
import {
  FiArrowLeft,
  FiPlay,
  FiCheckCircle,
  FiLoader,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import Link from "next/link";

export default function ResourcePlayerPage() {
  const { id } = useParams();
  const { data: resource, isLoading, error } = useResourceById(id as string);
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-slate-300" size={40} />
      </div>
    );
  if (error || !resource)
    return (
      <div className="p-20 text-center">
        <h2 className="font-black uppercase italic">Resource Not Found</h2>
      </div>
    );

  const currentModule = resource.modules[activeModuleIdx];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* 1. Header (Fixed) */}
      <header className="h-[65px] border-b border-slate-100 px-8 flex items-center justify-between bg-white shrink-0 z-10">
        <div className="flex items-center gap-6">
          <Link
            href="/creator/dashboard"
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter italic text-slate-900 leading-none">
              {resource.title}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
              Chapter {activeModuleIdx + 1}: {currentModule?.title}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 2. Main Player Area (Scrollable like YT) */}
        <main className="flex-1 bg-[#050505] overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto p-6 lg:p-10">
            {currentModule?.contentUrl ? (
              <>
                {/* THE YT VIDEO BOX */}
                <div className="w-48 h-32 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                  <video
                    key={currentModule.contentUrl}
                    src={currentModule.contentUrl}
                    controls
                    className="w-48 h-56 object-contain"
                    autoPlay
                  />
                </div>

                {/* VIDEO INFO BOX */}
                <div className="mt-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded">
                      Now Playing
                    </span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      Part {activeModuleIdx + 1}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">
                    {currentModule?.title}
                  </h2>
                  <div className="h-px w-full bg-white/10 mb-6" />
                  <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">
                    This module is part of the {resource.title} series. Continue
                    watching to complete your certification.
                  </p>
                </div>
              </>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-white/10">
                <FiLayers size={64} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">
                  No Video Uplink
                </p>
              </div>
            )}
          </div>
        </main>

        {/* 3. Curriculum Sidebar (Fixed Height) */}
        <aside className="hidden lg:block w-96 border-l border-slate-100 bg-white overflow-y-auto">
          <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Course Content
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {resource.modules.map((module: any, index: number) => (
              <button
                key={module.id}
                onClick={() => setActiveModuleIdx(index)}
                className={`w-full flex items-start gap-4 p-6 transition-all text-left ${
                  activeModuleIdx === index
                    ? "bg-slate-50 border-l-4 border-l-slate-900"
                    : "hover:bg-slate-100"
                }`}
              >
                <div
                  className={`mt-1 ${activeModuleIdx === index ? "text-slate-900" : "text-slate-300"}`}
                >
                  {activeModuleIdx === index ? (
                    <FiPlay size={14} />
                  ) : (
                    <FiCheckCircle size={14} />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p
                    className={`text-[11px] font-black uppercase italic leading-tight ${activeModuleIdx === index ? "text-slate-900" : "text-slate-500"}`}
                  >
                    {module.title}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 tracking-widest">
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
