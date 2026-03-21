"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FiPlay,
  FiLock,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiArrowRight,
  FiLoader,
  FiLayers,
  FiShield,
  FiZap,
} from "react-icons/fi";
import { resourceService } from "@/lib/services/resource.service";

export default function CourseDetailPage() {
  const { id } = useParams();

  // 🚀 Fetching from your service layer
  const { data: course, isLoading, isError } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourceService.getResourceById(id as string),
  });

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8F9FA] gap-4">
        <FiLoader className="animate-spin text-black" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Syncing Intelligence</p>
      </div>
    );

  if (isError) return <div className="p-20 text-center font-black">UNABLE TO RETRIEVE DATA CORE.</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] selection:bg-black selection:text-white">
      {/* --- EXTRA SUBTLE GRID OVERLAY --- */}
      <div className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* --- LEFT COLUMN: CONTENT --- */}
          <div className="lg:col-span-7">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-3 mb-10">
              <span className="bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full">
                Core Module
              </span>
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                {course?.language || "English"} Edition
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-10">
              {course?.title}
            </h1>

            <p className="text-slate-500 text-xl font-medium leading-relaxed mb-16 max-w-2xl border-l-4 border-black pl-8">
              {course?.description}
            </p>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-20 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Duration</p>
                <p className="font-black text-lg flex items-center gap-2 italic"><FiClock size={16}/>[left to update]</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Structure</p>
                <p className="font-black text-lg flex items-center gap-2 italic"><FiLayers size={16}/> {course?.modules?.length || 0} CHAPTERS</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Access</p>
                <p className="font-black text-lg flex items-center gap-2 italic"><FiShield size={16}/> LIFETIME</p>
              </div>
            </div>

            {/* --- SYLLABUS SECTION --- */}
            <div className="space-y-12">
              <div className="flex items-end justify-between border-b-2 border-slate-100 pb-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                  Curriculum <span className="text-slate-300 text-xl not-italic ml-2">[{course?.modules?.length}]</span>
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Scroll to explore</span>
              </div>

              <div className="space-y-4">
                {course?.modules?.length > 0 ? (
                  course.modules.map((mod: any, index: number) => (
                    <div
                      key={mod.id}
                      className="group flex items-center justify-between p-8 rounded-3xl border border-slate-100 bg-white hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 cursor-not-allowed overflow-hidden relative"
                    >
                      <div className="flex items-center gap-8 relative z-10">
                        <span className="text-4xl font-black italic text-slate-100 group-hover:text-black transition-colors duration-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h4 className="text-lg font-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                            {mod.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Video Chapter</span>
                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Locked</span>
                          </div>
                        </div>
                      </div>
                      <div className="relative z-10 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <FiLock size={18} />
                      </div>
                      {/* Subtle hover background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Curriculum Pending Initialization</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: STICKY PURCHASE CARD --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-black/10 relative overflow-hidden">
                {/* Visual Preview */}
                <div className="relative aspect-video mb-10 overflow-hidden rounded-[1.5rem] bg-black group cursor-pointer">
                  <img
                    src={course?.previewUrl || "/api/placeholder/800/450"}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:rotate-1 transition-all duration-700"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <FiPlay className="text-black fill-current translate-x-0.5" size={20} />
                    </div>
                  </div>
                  
                </div>

                <div className="flex items-end justify-between mb-10">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">
                      One-time License
                    </span>
                    <h3 className="text-6xl font-black italic tracking-tighter">
                      ${course?.price}
                    </h3>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl flex items-center gap-2">
                    <FiZap size={14} className="fill-current" />
                    <span className="text-[10px] font-black uppercase">Instant Access</span>
                  </div>
                </div>

                <button className="group w-full py-8 bg-black text-white text-[12px] font-black uppercase tracking-[0.5em] rounded-2xl hover:bg-slate-800 transition-all mb-8 flex items-center justify-center gap-6 active:scale-95">
                  Unlock Intelligence <FiArrowRight className="group-hover:translate-x-3 transition-transform" />
                </button>

                <div className="space-y-5 px-2">
                  {[
                    "Lifetime Access to Core Files",
                    "Architect Certificate (Digital)",
                    "Raw Exercise Assets Included",
                    "Private Community Uplink",
                  ].map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-tight"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <FiCheckCircle className="text-black" size={12} />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>

                {/* Decorative Element */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50" />
              </div>
              
              {/* Secondary Support Info */}
              <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                Secure 256-bit encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER SPACING --- */}
      <div className="h-40" />
    </div>
  );
}