"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useResourceById } from "@/hooks/useResource";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";
import api from "@/lib/api";
import {
  FiArrowLeft, FiPlay, FiCheckCircle, FiLoader, FiMenu, FiX,
  FiLock, FiChevronDown, FiChevronRight, FiBook, FiAward,
} from "react-icons/fi";
import { MdPlayCircle, MdOutlineOndemandVideo } from "react-icons/md";
import Link from "next/link";
import { toast } from "sonner";

function groupIntoSections(modules: any[]) {
  const sections: { title: string; lessons: any[] }[] = [];
  let current: { title: string; lessons: any[] } | null = null;
  for (const mod of modules) {
    const t = mod.sectionTitle || "Course Content";
    if (!current || current.title !== t) {
      current = { title: t, lessons: [] };
      sections.push(current);
    }
    current.lessons.push(mod);
  }
  return sections;
}

export default function ResourcePlayerPage() {
  const { id } = useParams();
  const { data: resource, isLoading, error } = useResourceById(id as string);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Local completion state — mirrors server, updated optimistically
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  // Per-video tracking refs (reset on module change)
  const hasTrackedView = useRef(false);
  const hasMarkedComplete = useRef(false);
  const videoDuration = useRef<number>(0);

  // Seed completedIds from server data once loaded
  useEffect(() => {
    if (resource?.modules) {
      const ids = new Set<string>(
        resource.modules.filter((m: any) => m.isCompleted).map((m: any) => m.id)
      );
      setCompletedIds(ids);
    }
  }, [resource]);

  // Set first unlocked module active on load
  useEffect(() => {
    if (resource?.modules?.length && !activeModuleId) {
      const first = resource.modules.find((m: any) => m.isUnlocked || resource.isCreator);
      if (first) setActiveModuleId(first.id);
    }
  }, [resource]);

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <FiLoader className="animate-spin text-slate-300" size={36} />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">Loading Course</p>
      </div>
    );

  if (error || !resource)
    return (
      <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-10 text-center">
        <div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Resource Not Found</h2>
          <Link href="/learn" className="text-[10px] font-bold uppercase mt-4 block text-slate-400 underline">Back to Learning</Link>
        </div>
      </div>
    );

  const isCreator = resource.isCreator;

  // Build effective modules list with local completion + sequential unlock
  const allModules: any[] = (resource.modules || []).map((m: any, idx: number) => {
    const isCompleted = completedIds.has(m.id);
    const prevCompleted = idx === 0 || completedIds.has(resource.modules[idx - 1].id);
    const isUnlocked = isCreator || prevCompleted;
    return { ...m, isCompleted, isUnlocked };
  });

  const sections = groupIntoSections(allModules);
  const currentModule = allModules.find((m) => m.id === activeModuleId) || allModules[0];
  const currentIdx = allModules.findIndex((m) => m.id === activeModuleId);
  const nextModule = allModules[currentIdx + 1] || null;
  const totalLessons = allModules.length;
  const completedCount = completedIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const markComplete = async (moduleId: string) => {
    if (completedIds.has(moduleId)) return;
    // Optimistic update
    setCompletedIds((prev) => new Set([...prev, moduleId]));
    try {
      const res = await api.post("/resources/complete-module", { moduleId });
      if (res.data?.isCourseFinished) {
        toast.success("🎉 Course completed! Badge awarded.", { duration: 5000 });
      }
    } catch {
      // Rollback on failure
      setCompletedIds((prev) => { const n = new Set(prev); n.delete(moduleId); return n; });
    }
  };

  const handleVideoLoaded = (e: any) => {
    videoDuration.current = e.target.duration || 0;
  };

  const handleTimeUpdate = (e: any) => {
    const video = e.target;
    const current = video.currentTime;
    const duration = video.duration || videoDuration.current;

    // View tracking at 5s
    if (current > 5 && !hasTrackedView.current) {
      hasTrackedView.current = true;
      api.patch(`/resources/${id}/view`).catch(() => { hasTrackedView.current = false; });
    }

    // Completion at 60%
    if (duration > 0 && current / duration >= 0.6 && !hasMarkedComplete.current && currentModule) {
      hasMarkedComplete.current = true;
      markComplete(currentModule.id);
    }
  };

  const handleModuleSelect = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setIsSidebarOpen(false);
    hasTrackedView.current = false;
    hasMarkedComplete.current = false;
    videoDuration.current = 0;
  };

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => {
      const n = new Set(prev);
      n.has(title) ? n.delete(title) : n.add(title);
      return n;
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
      {/* HEADER */}
      <header className="h-[60px] border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between bg-white shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 lg:gap-5 min-w-0">
          <Link href="/learn" className="text-slate-400 hover:text-slate-900 transition-colors shrink-0">
            <FiArrowLeft size={18} />
          </Link>
          <div className="border-l border-slate-100 pl-3 lg:pl-5 min-w-0">
            <h1 className="text-xs lg:text-sm font-black uppercase tracking-tighter italic text-slate-900 leading-none truncate max-w-[180px] md:max-w-sm lg:max-w-none">
              {resource.title}
            </h1>
            {currentModule && (
              <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest truncate max-w-[180px] md:max-w-none">
                {currentModule.sectionTitle || "Course Content"} &rsaquo; {currentModule.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCreator && (
            <span className="hidden md:flex items-center gap-1.5 bg-violet-50 text-violet-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider border border-violet-100">
              Creator View
            </span>
          )}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{completedCount}/{totalLessons}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors">
            {isSidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* PLAYER */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
          <div className="max-w-4xl mx-auto p-4 lg:p-8">
            {currentModule?.contentUrl ? (
              <div className="animate-in fade-in duration-300">
                {/* Video */}
                <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-200 relative">
                  <video
                    key={currentModule.id}
                    src={currentModule.contentUrl}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    onLoadedMetadata={handleVideoLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full object-contain"
                  />
                  {/* Completion flash */}
                  {completedIds.has(currentModule.id) && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full shadow-lg animate-in fade-in duration-500">
                      <FiCheckCircle size={11} /> Completed
                    </div>
                  )}
                </div>

                {/* Lesson info card */}
                <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                          {currentModule.sectionTitle || "Lesson"}
                        </span>
                        <span className="text-slate-300 text-[10px]">•</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          Lesson {currentIdx + 1} of {totalLessons}
                        </span>
                        {!completedIds.has(currentModule.id) && !isCreator && (
                          <span className="text-slate-300 text-[10px]">•</span>
                        )}
                        {!completedIds.has(currentModule.id) && !isCreator && (
                          <span className="text-amber-500 text-[9px] font-black uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full">
                            Watch 60% to unlock next
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                        {currentModule.title}
                      </h2>
                    </div>
                    {completedIds.has(currentModule.id) && (
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full shrink-0 border border-emerald-100">
                        <FiCheckCircle size={13} />
                        <span className="text-[10px] font-black uppercase tracking-wider">Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Up Next */}
                  {nextModule && (
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Up Next</p>
                      {nextModule.isUnlocked ? (
                        <button
                          onClick={() => handleModuleSelect(nextModule.id)}
                          className="flex items-center gap-3 w-full text-left group hover:bg-slate-50 p-3 rounded-lg transition-colors"
                        >
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                            <FiPlay size={12} className="text-slate-500 group-hover:text-blue-600 transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase italic text-slate-700 truncate group-hover:text-blue-600 transition-colors">{nextModule.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{nextModule.sectionTitle || "Next Lesson"}</p>
                          </div>
                          <FiChevronRight size={14} className="text-slate-300 ml-auto group-hover:text-blue-500 transition-colors" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <FiLock size={12} className="text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black uppercase italic text-slate-400 truncate">{nextModule.title}</p>
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Complete this lesson to unlock</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Meta cards */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { icon: <MdOutlineOndemandVideo size={15} />, label: `${totalLessons} Lessons`, color: "text-blue-600 bg-blue-50" },
                    { icon: <FiBook size={13} />, label: `${sections.length} Sections`, color: "text-violet-600 bg-violet-50" },
                    { icon: <FiAward size={13} />, label: resource.badge ? "Badge Included" : "No Badge", color: "text-amber-600 bg-amber-50" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>{item.icon}</div>
                      <span className="text-[10px] font-black uppercase text-slate-600 tracking-wide">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <LockedScreen totalLessons={totalLessons} isSequentialLock={resource.isOwned} />
            )}
          </div>
        </main>

        {/* Mobile overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed right-0 top-[60px] bottom-0 z-20 lg:relative lg:top-0 lg:translate-x-0 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          w-[320px] lg:w-[340px] border-l border-slate-200 bg-white overflow-y-auto flex flex-col shrink-0
        `}>
          {/* Sidebar header */}
          <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Course Content</h3>
              <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase">{sections.length} sections</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                <span className="text-[9px] font-black text-emerald-600">{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="flex-1 overflow-y-auto">
            {sections.map((section, si) => {
              const isCollapsed = collapsedSections.has(section.title);
              const sectionDone = section.lessons.filter((l: any) => completedIds.has(l.id)).length;
              return (
                <div key={si} className="border-b border-slate-50 last:border-0">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="text-[11px] font-black uppercase italic tracking-tight text-slate-800 truncate">{section.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {sectionDone}/{section.lessons.length} completed
                      </p>
                    </div>
                    <FiChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCollapsed ? "-rotate-90" : ""}`} />
                  </button>

                  {!isCollapsed && (
                    <div className="bg-slate-50/50">
                      {section.lessons.map((lesson: any) => {
                        const isActive = lesson.id === activeModuleId;
                        const isCompleted = completedIds.has(lesson.id);
                        const isLocked = !lesson.isUnlocked;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => !isLocked && handleModuleSelect(lesson.id)}
                            disabled={isLocked}
                            className={`w-full flex items-start gap-3 px-5 py-3.5 transition-all text-left border-l-2 ${
                              isActive
                                ? "bg-blue-50 border-l-blue-600"
                                : isLocked
                                ? "opacity-40 cursor-not-allowed border-l-transparent"
                                : "hover:bg-white border-l-transparent hover:border-l-slate-200"
                            }`}
                          >
                            {/* Status icon */}
                            <div className={`mt-0.5 shrink-0 transition-colors ${
                              isActive ? "text-blue-600"
                              : isCompleted ? "text-emerald-500"
                              : isLocked ? "text-slate-300"
                              : "text-slate-300"
                            }`}>
                              {isLocked ? (
                                <FiLock size={13} />
                              ) : isActive ? (
                                <MdPlayCircle size={16} />
                              ) : isCompleted ? (
                                <FiCheckCircle size={14} />
                              ) : (
                                <MdOutlineOndemandVideo size={14} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] leading-tight truncate transition-colors ${
                                isActive ? "font-black text-blue-700"
                                : isLocked ? "font-semibold text-slate-400"
                                : isCompleted ? "font-bold text-slate-500 line-through decoration-slate-300"
                                : "font-bold text-slate-600"
                              }`}>
                                {lesson.title}
                              </p>
                              <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                                isActive ? "text-blue-500"
                                : isLocked ? "text-slate-300"
                                : isCompleted ? "text-emerald-500"
                                : "text-slate-300"
                              }`}>
                                {isActive ? "Now Playing" : isLocked ? "Locked" : isCompleted ? "Done" : "Video"}
                              </p>
                            </div>

                            {/* Completion dot */}
                            {isCompleted && !isActive && (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LockedScreen({ totalLessons, isSequentialLock }: { totalLessons: number; isSequentialLock: boolean }) {
  return (
    <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-200 shadow-xl">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-5">
        <FiLock size={28} className="text-white/30" />
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
        {isSequentialLock ? "Complete Previous Lesson" : "Purchase to Unlock"}
      </p>
      <p className="text-[9px] font-bold mt-2 uppercase text-white/15">
        {isSequentialLock
          ? "Finish the current lesson to continue"
          : `Get full access to all ${totalLessons} lessons`}
      </p>
    </div>
  );
}
