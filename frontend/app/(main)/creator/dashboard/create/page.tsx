"use client";

import { useState } from "react";
import { useUploadMutation } from "@/hooks/useUpload";
import { useCreateResourceMutation } from "@/hooks/useResource";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft, FiArrowRight, FiPlus, FiLoader, FiSave,
  FiTrash2, FiImage, FiEdit3, FiMenu, FiChevronDown,
  FiChevronRight, FiCheck, FiVideo, FiBook, FiHelpCircle,
  FiAward, FiX,
} from "react-icons/fi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Lesson { id: string; title: string; contentUrl: string; sectionTitle: string; }
interface Section { id: string; title: string; lessons: Lesson[]; }
interface MCQQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

// ─── Sortable Lesson ──────────────────────────────────────────────────────────
function SortableLesson({ lesson, onRemove, onTitleChange }: {
  lesson: Lesson; onRemove: (id: string) => void; onTitleChange: (id: string, t: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 group hover:border-slate-300 transition-all shadow-sm">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 shrink-0" onPointerDown={(e) => e.stopPropagation()}>
        <FiMenu size={14} />
      </div>
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <MdOutlineOndemandVideo size={13} className="text-slate-500" />
      </div>
      <input type="text" value={lesson.title} onChange={(e) => onTitleChange(lesson.id, e.target.value)} onPointerDown={(e) => e.stopPropagation()}
        placeholder="Lesson title..." className="flex-1 text-sm font-semibold text-slate-700 focus:outline-none bg-transparent placeholder:text-slate-300 placeholder:font-normal" />
      {lesson.contentUrl
        ? <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Ready</span>
        : <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Uploading</span>}
      <button type="button" onClick={() => onRemove(lesson.id)} className="text-slate-200 hover:text-rose-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
        <FiTrash2 size={13} />
      </button>
    </div>
  );
}

// ─── Section Block ─────────────────────────────────────────────────────────────
function SectionBlock({ section, index, onRename, onRemove, onAddLesson, onRemoveLesson, onLessonTitleChange, onDragEnd, uploadingForSection }: {
  section: Section; index: number;
  onRename: (id: string, t: string) => void; onRemove: (id: string) => void;
  onAddLesson: (sid: string, f: File) => void; onRemoveLesson: (sid: string, lid: string) => void;
  onLessonTitleChange: (sid: string, lid: string, t: string) => void;
  onDragEnd: (sid: string, e: DragEndEvent) => void; uploadingForSection: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
        <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{index + 1}</div>
        <input type="text" value={section.title} onChange={(e) => onRename(section.id, e.target.value)} placeholder="Section title..."
          className="flex-1 text-sm font-black uppercase italic tracking-tight text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-300 placeholder:normal-case placeholder:not-italic" />
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{section.lessons.length} lessons</span>
          <button type="button" onClick={() => onRemove(section.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1"><FiTrash2 size={13} /></button>
          <button type="button" onClick={() => setCollapsed(!collapsed)} className="text-slate-400 hover:text-slate-700 transition-colors p-1">
            <FiChevronDown size={14} className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragEnd(section.id, e)}>
            <SortableContext items={section.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {section.lessons.map((lesson) => (
                <SortableLesson key={lesson.id} lesson={lesson} onRemove={(lid) => onRemoveLesson(section.id, lid)} onTitleChange={(lid, t) => onLessonTitleChange(section.id, lid, t)} />
              ))}
            </SortableContext>
          </DndContext>
          {uploadingForSection === section.id ? (
            <div className="flex items-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg px-4 py-3 animate-pulse">
              <FiLoader className="animate-spin text-slate-400" size={14} />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uploading video...</span>
            </div>
          ) : (
            <label className="flex items-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:border-slate-400 hover:bg-white transition-all group">
              <FiPlus size={14} className="text-slate-400 group-hover:text-slate-700 transition-colors" />
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 uppercase tracking-wider transition-colors">Add Lesson</span>
              <input type="file" hidden accept="video/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onAddLesson(section.id, f); e.target.value = ""; }} />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MCQ Question Card ────────────────────────────────────────────────────────
function QuestionCard({ q, index, onChange, onRemove }: {
  q: MCQQuestion; index: number;
  onChange: (id: string, updated: Partial<MCQQuestion>) => void;
  onRemove: (id: string) => void;
}) {
  // Local state so each keystroke doesn't fight stale closure props
  const [localQuestion, setLocalQuestion] = useState(q.question);
  const [localOptions, setLocalOptions] = useState<[string, string, string, string]>([
    q.options[0], q.options[1], q.options[2], q.options[3],
  ]);

  const handleOptionChange = (oi: number, value: string) => {
    const next: [string, string, string, string] = [localOptions[0], localOptions[1], localOptions[2], localOptions[3]];
    next[oi] = value;
    setLocalOptions(next);
    onChange(q.id, { options: next });
  };

  const handleQuestionChange = (value: string) => {
    setLocalQuestion(value);
    onChange(q.id, { question: value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{index + 1}</div>
        </div>
        <textarea
          value={localQuestion}
          onChange={(e) => handleQuestionChange(e.target.value)}
          placeholder="Enter your question..."
          rows={2}
          className="flex-1 text-sm font-semibold text-slate-800 focus:outline-none bg-slate-50 border border-slate-100 rounded-lg p-3 resize-none focus:border-slate-300 transition-colors"
        />
        <button type="button" onClick={() => onRemove(q.id)} className="text-slate-300 hover:text-rose-500 transition-colors shrink-0 mt-1">
          <FiX size={15} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
        {localOptions.map((opt, oi) => (
          <div key={oi} className={`flex items-center gap-2 border rounded-lg px-3 py-2 transition-all ${q.correctIndex === oi ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
            <button
              type="button"
              onClick={() => onChange(q.id, { correctIndex: oi })}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${q.correctIndex === oi ? "border-emerald-500 bg-emerald-500" : "border-slate-300 hover:border-emerald-400"}`}
            >
              {q.correctIndex === oi && <div className="w-2 h-2 rounded-full bg-white" />}
            </button>
            <input
              type="text"
              value={opt}
              onChange={(e) => handleOptionChange(oi, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + oi)}`}
              className={`flex-1 text-xs font-medium focus:outline-none bg-transparent ${q.correctIndex === oi ? "text-emerald-700" : "text-slate-600"}`}
            />
            {q.correctIndex === oi && (
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-wider shrink-0">Correct</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [{ n: 1, label: "Course Info" }, { n: 2, label: "Curriculum" }, { n: 3, label: "Assignment" }];
  return (
    <div className="flex items-center gap-2 mb-10 flex-wrap">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${step === n ? "bg-slate-900 text-white" : step > n ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}>
              {step > n ? <FiCheck size={13} /> : n}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${step === n ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <FiChevronRight size={14} className="text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateResourcePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdResourceId, setCreatedResourceId] = useState<string | null>(null);

  const [courseInfo, setCourseInfo] = useState({ title: "", description: "", price: 0, thumbnail: "", badgeId: "" });
  const [sections, setSections] = useState<Section[]>([{ id: crypto.randomUUID(), title: "Getting Started", lessons: [] }]);
  const [uploadingForSection, setUploadingForSection] = useState<string | null>(null);

  // Assignment state
  const [passScore, setPassScore] = useState(70);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  const { mutate: upload, isPending: isUploading, variables } = useUploadMutation();
  const createResource = useCreateResourceMutation();

  // ── Step 1 ──
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload({ file, type: "thumbnail" }, {
      onSuccess: (res) => { setCourseInfo((p) => ({ ...p, thumbnail: res.url })); toast.success("Thumbnail uploaded!"); },
      onError: () => toast.error("Thumbnail upload failed."),
    });
  };
  const canProceedStep1 = courseInfo.title.trim() && courseInfo.description.trim() && courseInfo.thumbnail;

  // ── Step 2 ──
  const addSection = () => setSections((p) => [...p, { id: crypto.randomUUID(), title: `Section ${p.length + 1}`, lessons: [] }]);
  const renameSection = (id: string, title: string) => setSections((p) => p.map((s) => s.id === id ? { ...s, title } : s));
  const removeSection = (id: string) => setSections((p) => p.filter((s) => s.id !== id));
  const addLesson = (sectionId: string, file: File) => {
    setUploadingForSection(sectionId);
    const lessonId = crypto.randomUUID();
    upload({ file, type: "video" }, {
      onSuccess: (res) => {
        setSections((p) => p.map((s) => s.id === sectionId ? { ...s, lessons: [...s.lessons, { id: lessonId, title: file.name.replace(/\.[^/.]+$/, ""), contentUrl: res.url, sectionTitle: s.title }] } : s));
        toast.success("Lesson uploaded!"); setUploadingForSection(null);
      },
      onError: () => { toast.error("Video upload failed."); setUploadingForSection(null); },
    });
  };
  const removeLesson = (sid: string, lid: string) => setSections((p) => p.map((s) => s.id === sid ? { ...s, lessons: s.lessons.filter((l) => l.id !== lid) } : s));
  const lessonTitleChange = (sid: string, lid: string, title: string) => setSections((p) => p.map((s) => s.id === sid ? { ...s, lessons: s.lessons.map((l) => l.id === lid ? { ...l, title } : l) } : s));
  const handleLessonDragEnd = (sid: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((p) => p.map((s) => { if (s.id !== sid) return s; const oi = s.lessons.findIndex((l) => l.id === active.id); const ni = s.lessons.findIndex((l) => l.id === over.id); return { ...s, lessons: arrayMove(s.lessons, oi, ni) }; }));
  };
  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  const handlePublishCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalLessons === 0) return toast.error("Add at least one lesson before publishing.");
    const modules = sections.flatMap((s) => s.lessons.map((l) => ({ title: l.title, url: l.contentUrl, sectionTitle: s.title })));
    createResource.mutate({ ...courseInfo, modules } as any, {
      onSuccess: (res: any) => {
        toast.success("Course published!");
        const rid = res?.data?.id || res?.id;
        if (rid) { setCreatedResourceId(rid); setStep(3); }
        else { router.push("/creator/dashboard"); }
      },
      onError: (err: any) => toast.error(err.message || "Publishing failed"),
    });
  };

  // ── Step 3 ──
  const addQuestion = () => {
    if (questions.length >= 50) return toast.error("Maximum 50 questions allowed.");
    setQuestions((p) => [...p, {
      id: crypto.randomUUID(),
      question: "",
      options: ["", "", "", ""] as [string, string, string, string],
      correctIndex: 0,
    }]);
  };
  const updateQuestion = (id: string, updated: Partial<MCQQuestion>) =>
    setQuestions((p) => p.map((q) => q.id === id ? { ...q, ...updated } : q));
  const removeQuestion = (id: string) => setQuestions((p) => p.filter((q) => q.id !== id));

  const handleSaveAssignment = async () => {
    if (questions.length === 0) { router.push("/creator/dashboard"); return; }
    for (const q of questions) {
      if (!q.question.trim()) return toast.error("All questions must have text.");
      // Normalize options — handles both array and any edge cases
      const opts: string[] = Array.isArray(q.options)
        ? q.options.map(String)
        : [0, 1, 2, 3].map((i) => String((q.options as any)[i] ?? ""));
      if (opts.some((o) => !o.trim())) return toast.error(`Question ${questions.indexOf(q) + 1}: all 4 options must be filled in.`);
    }
    if (!createdResourceId) return toast.error("Course ID missing.");
    setIsSavingAssignment(true);
    try {
      await api.put(`/resources/${createdResourceId}/assignment`, {
        passScore,
        questions: questions.map((q) => ({
          question: q.question,
          options: Array.isArray(q.options) ? q.options.map(String) : [0,1,2,3].map((i) => String((q.options as any)[i] ?? "")),
          correctIndex: q.correctIndex,
        })),
      });
      toast.success("Assignment saved!");
      router.push("/creator/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setIsSavingAssignment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <Link href="/creator/dashboard" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 mb-8 transition-all">
          <FiArrowLeft size={13} /> Back to Studio
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Create <span className="text-blue-600">New Course</span></h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Build a structured course with sections, lessons, and an assignment.</p>
        </div>
        <StepIndicator step={step} />

        {/* ── STEP 1: Course Info ── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Course Title <span className="text-rose-400">*</span></label>
                <input type="text" required value={courseInfo.title} className="w-full border-b-2 border-slate-100 py-3 focus:outline-none focus:border-slate-900 text-lg font-bold text-slate-900 transition-colors" placeholder="e.g. Advanced Backend Architecture" onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Description <span className="text-rose-400">*</span></label>
                <textarea rows={4} required value={courseInfo.description} className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-300 text-sm bg-slate-50/50 rounded-lg resize-none text-slate-700 transition-colors" placeholder="What will your students learn?" onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Price (NPR) <span className="text-rose-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">NPR</span>
                  <input type="number" required min={0} value={courseInfo.price || ""} className="w-full border border-slate-100 rounded-lg pl-14 pr-4 py-3 focus:outline-none focus:border-slate-300 font-bold text-slate-900 bg-slate-50/50 transition-colors" placeholder="999" onChange={(e) => setCourseInfo({ ...courseInfo, price: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">Course Thumbnail <span className="text-rose-400">*</span></label>
              <label className="relative flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all overflow-hidden group max-w-lg">
                {courseInfo.thumbnail ? (
                  <><img src={courseInfo.thumbnail} className="w-full h-full object-cover" alt="thumbnail" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-white text-[10px] font-black uppercase tracking-widest">Change Thumbnail</span></div></>
                ) : (
                  <div className="flex flex-col items-center text-slate-300 gap-3">
                    {isUploading && variables?.type === "thumbnail" ? <FiLoader className="animate-spin" size={28} /> : <FiImage size={28} />}
                    <div className="text-center"><p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Upload Thumbnail</p><p className="text-[9px] text-slate-300 mt-1">Recommended: 1280×720px</p></div>
                  </div>
                )}
                <input type="file" hidden accept="image/*" onChange={handleThumbnailUpload} />
              </label>
            </div>
            <div className="flex justify-end">
              <button type="button" disabled={!canProceedStep1 || (isUploading && variables?.type === "thumbnail")} onClick={() => setStep(2)} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-slate-800 disabled:opacity-30 transition-all">
                Continue to Curriculum <FiArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Curriculum ── */}
        {step === 2 && (
          <form onSubmit={handlePublishCourse} className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-5">
              {courseInfo.thumbnail && <img src={courseInfo.thumbnail} className="w-16 h-10 object-cover rounded-lg border border-slate-200 shrink-0" alt="" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black uppercase italic tracking-tight text-slate-900 truncate">{courseInfo.title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">NPR {courseInfo.price?.toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-wider flex items-center gap-1"><FiEdit3 size={11} /> Edit Info</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ icon: <FiBook size={14} />, label: "Sections", value: sections.length, color: "text-violet-600 bg-violet-50" }, { icon: <FiVideo size={14} />, label: "Lessons", value: totalLessons, color: "text-blue-600 bg-blue-50" }].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
                  <div><p className="text-2xl font-black text-slate-900">{s.value}</p><p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {sections.map((section, i) => (
                <SectionBlock key={section.id} section={section} index={i} onRename={renameSection} onRemove={removeSection} onAddLesson={addLesson} onRemoveLesson={removeLesson} onLessonTitleChange={lessonTitleChange} onDragEnd={handleLessonDragEnd} uploadingForSection={uploadingForSection} />
              ))}
            </div>
            <button type="button" onClick={addSection} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:border-slate-400 hover:text-slate-700 hover:bg-white transition-all">
              <FiPlus size={14} /> Add Section
            </button>
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-wider"><FiArrowLeft size={13} /> Back</button>
              <button type="submit" disabled={createResource.isPending || isUploading || totalLessons === 0} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-slate-800 disabled:opacity-30 transition-all">
                {createResource.isPending ? <FiLoader className="animate-spin" size={14} /> : <FiArrowRight size={14} />}
                Publish & Add Assignment
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Assignment ── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <FiAward size={18} className="text-amber-500" />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-black uppercase italic tracking-tight text-slate-900">Final Assignment</h2>
                  <p className="text-xs text-slate-500 mt-1">Students must pass this MCQ to earn the course badge. You can skip this step if no assignment is needed.</p>
                </div>
              </div>

              {/* Pass score */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-3">Pass Score (%)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min={10} max={100} step={5} value={passScore} onChange={(e) => setPassScore(Number(e.target.value))} className="flex-1 accent-slate-900" />
                  <div className="w-16 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm font-black shrink-0">{passScore}%</div>
                </div>
                <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Students need {passScore}% or above to pass and earn the badge</p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((q, i) => (
                <QuestionCard key={q.id} q={q} index={i} onChange={updateQuestion} onRemove={removeQuestion} />
              ))}
            </div>

            {/* Add question */}
            {questions.length < 50 && (
              <button type="button" onClick={addQuestion} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:border-slate-400 hover:text-slate-700 hover:bg-white transition-all">
                <FiHelpCircle size={14} /> Add Question
                <span className="text-[9px] text-slate-300 ml-1">({questions.length}/50)</span>
              </button>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => router.push("/creator/dashboard")} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-wider">
                Skip & Finish
              </button>
              <button type="button" onClick={handleSaveAssignment} disabled={isSavingAssignment} className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-slate-800 disabled:opacity-30 transition-all">
                {isSavingAssignment ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
                Save Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
