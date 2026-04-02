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
  FiAlertCircle, FiDownload, FiUser,
} from "react-icons/fi";
import { MdPlayCircle, MdOutlineOndemandVideo } from "react-icons/md";
import Link from "next/link";
import { toast } from "sonner";

function groupIntoSections(modules: any[]) {
  const sections: { title: string; lessons: any[] }[] = [];
  let current: { title: string; lessons: any[] } | null = null;
  for (const mod of modules) {
    const t = mod.sectionTitle || "Course Content";
    if (!current || current.title !== t) { current = { title: t, lessons: [] }; sections.push(current); }
    current.lessons.push(mod);
  }
  return sections;
}

// ─── Badge Modal ──────────────────────────────────────────────────────────────
function BadgeModal({ badge, onClose }: { badge: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors">
          <FiX size={18} />
        </button>
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center overflow-hidden">
            {badge?.iconUrl
              ? <img src={badge.iconUrl} alt={badge.name} className="w-full h-full object-cover" />
              : <FiAward size={40} className="text-amber-400" />}
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider mb-3">
            <FiCheckCircle size={11} /> Badge Earned
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 mb-1">{badge?.name || "Achievement"}</h2>
          <p className="text-xs text-slate-500 mb-8">{badge?.description || "You've completed this course."}</p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => toast.info("Download coming soon!")}
              className="flex items-center justify-center gap-2 border-2 border-slate-200 rounded-xl py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all"
            >
              <FiDownload size={13} /> Download
            </button>
            <button
              onClick={() => toast.info("Profile feature coming soon!")}
              className="flex items-center justify-center gap-2 bg-slate-900 text-white rounded-xl py-3 text-[11px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all"
            >
              <FiUser size={13} /> Add to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MCQ Assignment Panel ─────────────────────────────────────────────────────
function AssignmentPanel({ resourceId, assignment, badge, isCreator, onPassed }: {
  resourceId: string; assignment: any; badge: any; isCreator: boolean; onPassed: () => void;
}) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number; pct: number; passed: boolean; badgeAwarded: boolean } | null>(null);

  useEffect(() => {
    api.get(`/resources/${resourceId}/assignment`)
      .then((res) => {
        setQuestions(res.data.questions || []);
        setAnswers(new Array(res.data.questions?.length || 0).fill(null));
        if (res.data.hasPassed) setResult({ score: 0, total: 0, pct: 100, passed: true, badgeAwarded: false });
      })
      .catch(() => toast.error("Failed to load assignment"))
      .finally(() => setIsLoading(false));
  }, [resourceId]);

  const handleSubmit = async () => {
    if (answers.some((a) => a === null)) return toast.error("Please answer all questions before submitting.");
    setIsSubmitting(true);
    try {
      const res = await api.post(`/resources/assignment/${assignment.id}/submit`, { answers });
      setResult(res.data);
      if (res.data.passed) { toast.success("You passed! 🎉"); onPassed(); }
      else toast.error(`You scored ${res.data.pct}%. Need ${assignment.passScore}% to pass.`);
    } catch { toast.error("Submission failed."); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-16"><FiLoader className="animate-spin text-slate-300" size={24} /></div>
  );

  // Already passed
  if (result?.passed) return (
    <div className="text-center py-12 px-6">
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <FiCheckCircle size={28} className="text-emerald-500" />
      </div>
      <h3 className="text-lg font-black uppercase italic tracking-tighter text-slate-900 mb-1">Assignment Passed</h3>
      <p className="text-xs text-slate-500 mb-6">You've successfully completed this course's final assessment.</p>
      {badge && (
        <button onClick={onPassed} className="inline-flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-amber-600 transition-all shadow-lg">
          <FiAward size={14} /> Claim Your Badge
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-900">Final Assignment</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{questions.length} questions • Pass at {assignment.passScore}%</p>
        </div>
        {badge && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
            <FiAward size={13} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider">{badge.name}</span>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q: any, qi: number) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-2">Q{qi + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {(q.options as string[]).map((opt: string, oi: number) => {
                const isSelected = answers[qi] === oi;
                return (
                  <button key={oi} type="button" onClick={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-slate-600"}`}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      {questions.length > 0 && (
        <button onClick={handleSubmit} disabled={isSubmitting || answers.some((a) => a === null)}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-30 transition-all shadow-lg"
        >
          {isSubmitting ? <FiLoader className="animate-spin" size={14} /> : <FiCheckCircle size={14} />}
          Submit Assignment
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ResourcePlayerPage() {
  const { id } = useParams();
  const { data: resource, isLoading, error } = useResourceById(id as string);
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [showAssignment, setShowAssignment] = useState(false);
  const [assignmentPassed, setAssignmentPassed] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const hasTrackedView = useRef(false);
  const hasMarkedComplete = useRef(false);
  const videoDuration = useRef<number>(0);

  useEffect(() => {
    if (resource?.modules) {
      const ids = new Set<string>(resource.modules.filter((m: any) => m.isCompleted).map((m: any) => m.id));
      setCompletedIds(ids);
    }
    if (resource?.assignment?.hasPassed) setAssignmentPassed(true);
  }, [resource]);

  useEffect(() => {
    if (resource?.modules?.length && !activeModuleId) {
      const first = resource.modules.find((m: any) => m.isUnlocked || resource.isCreator);
      if (first) setActiveModuleId(first.id);
    }
  }, [resource]);

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <FiLoader className="animate-spin text-slate-300" size={36} />
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">Loading Course</p>
    </div>
  );

  if (error || !resource) return (
    <div className="h-screen flex items-center justify-center bg-[#f8fafc] p-10 text-center">
      <div>
        <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Resource Not Found</h2>
        <Link href="/learn" className="text-[10px] font-bold uppercase mt-4 block text-slate-400 underline">Back to Learning</Link>
      </div>
    </div>
  );

  const isCreator = resource.isCreator;
  const allModules: any[] = (resource.modules || []).map((m: any, idx: number) => {
    const isCompleted = completedIds.has(m.id);
    const prevCompleted = idx === 0 || completedIds.has(resource.modules[idx - 1].id);
    return { ...m, isCompleted, isUnlocked: isCreator || prevCompleted };
  });

  const sections = groupIntoSections(allModules);
  const currentModule = allModules.find((m) => m.id === activeModuleId) || allModules[0];
  const currentIdx = allModules.findIndex((m) => m.id === activeModuleId);
  const nextModule = allModules[currentIdx + 1] || null;
  const totalLessons = allModules.length;
  const completedCount = completedIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const allLessonsComplete = completedCount >= totalLessons && totalLessons > 0;
  const hasAssignment = !!resource.assignment;
  // Assignment unlocked when all lessons done OR creator
  const assignmentUnlocked = isCreator || allLessonsComplete;

  const markComplete = async (moduleId: string) => {
    if (completedIds.has(moduleId)) return;
    setCompletedIds((prev) => new Set([...prev, moduleId]));
    try {
      const res = await api.post("/resources/complete-module", { moduleId });
      if (res.data?.isCourseFinished && !hasAssignment) toast.success("🎉 All lessons complete!");
      if (res.data?.isCourseFinished && hasAssignment) toast.success("All lessons done! Take the assignment to earn your badge.");
    } catch {
      setCompletedIds((prev) => { const n = new Set(prev); n.delete(moduleId); return n; });
    }
  };

  const handleVideoLoaded = (e: any) => { videoDuration.current = e.target.duration || 0; };
  const handleTimeUpdate = (e: any) => {
    const video = e.target;
    const dur = video.duration || videoDuration.current;
    if (video.currentTime > 5 && !hasTrackedView.current) { hasTrackedView.current = true; api.patch(`/resources/${id}/view`).catch(() => { hasTrackedView.current = false; }); }
    if (dur > 0 && video.currentTime / dur >= 0.6 && !hasMarkedComplete.current && currentModule) { hasMarkedComplete.current = true; markComplete(currentModule.id); }
  };

  const handleModuleSelect = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setShowAssignment(false);
    setIsSidebarOpen(false);
    hasTrackedView.current = false;
    hasMarkedComplete.current = false;
    videoDuration.current = 0;
  };

  const toggleSection = (title: string) => setCollapsedSections((prev) => { const n = new Set(prev); n.has(title) ? n.delete(title) : n.add(title); return n; });

  return (
    <>
      {showBadgeModal && resource.badge && <BadgeModal badge={resource.badge} onClose={() => setShowBadgeModal(false)} />}

      <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden">
        {/* HEADER */}
        <header className="h-[60px] border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between bg-white shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 lg:gap-5 min-w-0">
            <Link href="/learn" className="text-slate-400 hover:text-slate-900 transition-colors shrink-0"><FiArrowLeft size={18} /></Link>
            <div className="border-l border-slate-100 pl-3 lg:pl-5 min-w-0">
              <h1 className="text-xs lg:text-sm font-black uppercase tracking-tighter italic text-slate-900 leading-none truncate max-w-[180px] md:max-w-sm lg:max-w-none">{resource.title}</h1>
              {currentModule && !showAssignment && (
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest truncate max-w-[180px] md:max-w-none">
                  {currentModule.sectionTitle || "Course Content"} &rsaquo; {currentModule.title}
                </p>
              )}
              {showAssignment && <p className="text-[9px] font-bold text-amber-500 uppercase mt-0.5 tracking-widest">Final Assignment</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isCreator && <span className="hidden md:flex items-center gap-1.5 bg-violet-50 text-violet-600 text-[9px] font-black uppercase px-3 py-1.5 rounded-full tracking-wider border border-violet-100">Creator View</span>}
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
          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto p-4 lg:p-8">
              {showAssignment ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-in fade-in duration-300">
                  <AssignmentPanel
                    resourceId={id as string}
                    assignment={resource.assignment}
                    badge={resource.badge}
                    isCreator={isCreator}
                    onPassed={() => { setAssignmentPassed(true); setShowBadgeModal(true); }}
                  />
                </div>
              ) : currentModule?.contentUrl ? (
                <div className="animate-in fade-in duration-300">
                  <div className="w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-xl border border-slate-200 relative">
                    <video key={currentModule.id} src={currentModule.contentUrl} controls autoPlay controlsList="nodownload"
                      onLoadedMetadata={handleVideoLoaded} onTimeUpdate={handleTimeUpdate} className="w-full h-full object-contain" />
                    {completedIds.has(currentModule.id) && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500 text-white text-[9px] font-black uppercase px-2.5 py-1.5 rounded-full shadow-lg animate-in fade-in duration-500">
                        <FiCheckCircle size={11} /> Completed
                      </div>
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="mt-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">{currentModule.sectionTitle || "Lesson"}</span>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Lesson {currentIdx + 1} of {totalLessons}</span>
                          {!completedIds.has(currentModule.id) && !isCreator && (
                            <><span className="text-slate-300 text-[10px]">•</span>
                            <span className="text-amber-500 text-[9px] font-black uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full">Watch 60% to unlock next</span></>
                          )}
                        </div>
                        <h2 className="text-xl lg:text-2xl font-black uppercase italic tracking-tighter text-slate-900">{currentModule.title}</h2>
                      </div>
                      {completedIds.has(currentModule.id) && (
                        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full shrink-0 border border-emerald-100">
                          <FiCheckCircle size={13} /><span className="text-[10px] font-black uppercase tracking-wider">Completed</span>
                        </div>
                      )}
                    </div>

                    {/* Up Next / Assignment CTA */}
                    <div className="mt-5 pt-5 border-t border-slate-100 space-y-3">
                      {nextModule && (
                        <>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Up Next</p>
                          {nextModule.isUnlocked ? (
                            <button onClick={() => handleModuleSelect(nextModule.id)} className="flex items-center gap-3 w-full text-left group hover:bg-slate-50 p-3 rounded-lg transition-colors">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors"><FiPlay size={12} className="text-slate-500 group-hover:text-blue-600 transition-colors" /></div>
                              <div className="min-w-0"><p className="text-xs font-black uppercase italic text-slate-700 truncate group-hover:text-blue-600 transition-colors">{nextModule.title}</p><p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{nextModule.sectionTitle || "Next Lesson"}</p></div>
                              <FiChevronRight size={14} className="text-slate-300 ml-auto group-hover:text-blue-500 transition-colors" />
                            </button>
                          ) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0"><FiLock size={12} className="text-slate-400" /></div>
                              <div className="min-w-0"><p className="text-xs font-black uppercase italic text-slate-400 truncate">{nextModule.title}</p><p className="text-[9px] font-bold text-slate-300 uppercase tracking-wider mt-0.5">Complete this lesson to unlock</p></div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Assignment unlock CTA — shows when all lessons done */}
                      {hasAssignment && allLessonsComplete && !nextModule && (
                        <div className={`mt-2 rounded-xl border-2 p-4 transition-all ${assignmentPassed ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${assignmentPassed ? "bg-emerald-100" : "bg-amber-100"}`}>
                                <FiAward size={16} className={assignmentPassed ? "text-emerald-600" : "text-amber-600"} />
                              </div>
                              <div>
                                <p className={`text-[11px] font-black uppercase tracking-wider ${assignmentPassed ? "text-emerald-700" : "text-amber-700"}`}>
                                  {assignmentPassed ? "Assignment Passed!" : "Final Assignment Unlocked"}
                                </p>
                                <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${assignmentPassed ? "text-emerald-500" : "text-amber-500"}`}>
                                  {assignmentPassed ? "Click to claim your badge" : `Pass at ${resource.assignment.passScore}% to earn the badge`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => assignmentPassed ? setShowBadgeModal(true) : setShowAssignment(true)}
                              className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${assignmentPassed ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-amber-500 text-white hover:bg-amber-600"}`}
                            >
                              {assignmentPassed ? "Claim Badge" : "Start"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta cards */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      { icon: <MdOutlineOndemandVideo size={15} />, label: `${totalLessons} Lessons`, color: "text-blue-600 bg-blue-50" },
                      { icon: <FiBook size={13} />, label: `${sections.length} Sections`, color: "text-violet-600 bg-violet-50" },
                      { icon: <FiAward size={13} />, label: resource.badge ? resource.badge.name : "No Badge", color: "text-amber-600 bg-amber-50" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>{item.icon}</div>
                        <span className="text-[10px] font-black uppercase text-slate-600 tracking-wide truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-slate-200 shadow-xl">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-5"><FiLock size={28} className="text-white/30" /></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">{resource.isOwned ? "Complete Previous Lesson" : "Purchase to Unlock"}</p>
                  <p className="text-[9px] font-bold mt-2 uppercase text-white/15">{resource.isOwned ? "Finish the current lesson to continue" : `Get full access to all ${totalLessons} lessons`}</p>
                </div>
              )}
            </div>
          </main>

          {isSidebarOpen && <div className="fixed inset-0 bg-black/30 z-10 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

          {/* SIDEBAR */}
          <aside className={`fixed right-0 top-[60px] bottom-0 z-20 lg:relative lg:top-0 lg:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} w-[320px] lg:w-[340px] border-l border-slate-200 bg-white overflow-y-auto flex flex-col shrink-0`}>
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

            <div className="flex-1 overflow-y-auto">
              {sections.map((section, si) => {
                const isCollapsed = collapsedSections.has(section.title);
                const sectionDone = section.lessons.filter((l: any) => completedIds.has(l.id)).length;
                return (
                  <div key={si} className="border-b border-slate-50 last:border-0">
                    <button onClick={() => toggleSection(section.title)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                      <div className="flex-1 min-w-0 pr-3">
                        <p className="text-[11px] font-black uppercase italic tracking-tight text-slate-800 truncate">{section.title}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{sectionDone}/{section.lessons.length} completed</p>
                      </div>
                      <FiChevronDown size={14} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isCollapsed ? "-rotate-90" : ""}`} />
                    </button>
                    {!isCollapsed && (
                      <div className="bg-slate-50/50">
                        {section.lessons.map((lesson: any) => {
                          const isActive = lesson.id === activeModuleId && !showAssignment;
                          const isCompleted = completedIds.has(lesson.id);
                          const isLocked = !lesson.isUnlocked;
                          return (
                            <button key={lesson.id} onClick={() => !isLocked && handleModuleSelect(lesson.id)} disabled={isLocked}
                              className={`w-full flex items-start gap-3 px-5 py-3.5 transition-all text-left border-l-2 ${isActive ? "bg-blue-50 border-l-blue-600" : isLocked ? "opacity-40 cursor-not-allowed border-l-transparent" : "hover:bg-white border-l-transparent hover:border-l-slate-200"}`}
                            >
                              <div className={`mt-0.5 shrink-0 transition-colors ${isActive ? "text-blue-600" : isCompleted ? "text-emerald-500" : "text-slate-300"}`}>
                                {isLocked ? <FiLock size={13} /> : isActive ? <MdPlayCircle size={16} /> : isCompleted ? <FiCheckCircle size={14} /> : <MdOutlineOndemandVideo size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-[11px] leading-tight truncate transition-colors ${isActive ? "font-black text-blue-700" : isLocked ? "font-semibold text-slate-400" : isCompleted ? "font-bold text-slate-500 line-through decoration-slate-300" : "font-bold text-slate-600"}`}>{lesson.title}</p>
                                <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${isActive ? "text-blue-500" : isLocked ? "text-slate-300" : isCompleted ? "text-emerald-500" : "text-slate-300"}`}>
                                  {isActive ? "Now Playing" : isLocked ? "Locked" : isCompleted ? "Done" : "Video"}
                                </p>
                              </div>
                              {isCompleted && !isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Assignment entry in sidebar */}
              {hasAssignment && (
                <div className="border-t border-slate-100">
                  <button
                    onClick={() => assignmentUnlocked && setShowAssignment(true)}
                    disabled={!assignmentUnlocked}
                    className={`w-full flex items-start gap-3 px-5 py-4 transition-all text-left border-l-2 ${showAssignment ? "bg-amber-50 border-l-amber-500" : assignmentUnlocked ? "hover:bg-amber-50/50 border-l-transparent hover:border-l-amber-300" : "opacity-40 cursor-not-allowed border-l-transparent"}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${showAssignment ? "text-amber-500" : assignmentUnlocked ? "text-amber-400" : "text-slate-300"}`}>
                      {assignmentUnlocked ? <FiAward size={15} /> : <FiLock size={13} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-bold leading-tight ${showAssignment ? "font-black text-amber-700" : assignmentUnlocked ? "text-slate-600" : "text-slate-400"}`}>Final Assignment</p>
                      <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${showAssignment ? "text-amber-500" : assignmentUnlocked ? "text-slate-400" : "text-slate-300"}`}>
                        {assignmentPassed ? "Passed ✓" : assignmentUnlocked ? `${resource.assignment.questionCount} questions` : "Complete all lessons"}
                      </p>
                    </div>
                    {assignmentPassed && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
