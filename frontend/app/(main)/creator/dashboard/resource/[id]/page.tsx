"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useResourceById } from "@/hooks/useResource";
import {
  FiArrowLeft,
  FiPlay,
  FiLock,
  FiCheckCircle,
  FiLoader,
  FiClock,
  FiLayers,
} from "react-icons/fi";
import Link from "next/link";

export default function ResourcePlayerPage() {
  const { id } = useParams();
  const { data: resource, isLoading, error } = useResourceById(id as string);

  // Track which video is currently playing
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
        <Link
          href="/creator/dashboard"
          className="text-xs underline mt-4 block"
        >
          Return to Dashboard
        </Link>
      </div>
    );

  const currentModule = resource.modules[activeModuleIdx];

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Bar */}
      <header className="border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
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
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-black bg-slate-100 px-2 py-1 rounded-sm uppercase">
            Preview Mode
          </span>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* 2. Main Player Area */}
        <main className="flex-1 bg-black aspect-video lg:aspect-auto lg:h-[calc(100vh-65px)] overflow-hidden flex items-center justify-center">
          {currentModule ? (
            <video
              key={currentModule.contentUrl} // Force re-render when video changes
              src={currentModule.contentUrl}
              controls
              className="w-full h-full max-h-full object-contain"
              autoPlay
            />
          ) : (
            <div className="text-white text-center">
              <FiLayers size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                No Content Uploaded
              </p>
            </div>
          )}
        </main>

        {/* 3. Curriculum Sidebar */}
        <aside className="w-full lg:w-96 border-l border-slate-100 h-[calc(100vh-65px)] overflow-y-auto bg-slate-50/30">
          <div className="p-6 border-b border-slate-100 bg-white">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Series Curriculum
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {resource.modules.map((module: any, index: number) => (
              <button
                key={module.id}
                onClick={() => setActiveModuleIdx(index)}
                className={`w-full flex items-start gap-4 p-6 transition-all text-left ${
                  activeModuleIdx === index
                    ? "bg-white border-l-4 border-l-slate-900"
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
                    className={`text-[11px] font-black uppercase italic leading-tight ${
                      activeModuleIdx === index
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {module.title}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Part {index + 1}</span>
                    <span className="flex items-center gap-1">
                      <FiClock /> Video
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
