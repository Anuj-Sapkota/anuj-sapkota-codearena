"use client";

import { useState } from "react";
import { useUploadMutation } from "@/hooks/useUpload";
import { useCreateResourceMutation } from "@/hooks/useResource";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft, FiArrowRight, FiPlus, FiLoader, FiSave,
  FiTrash2, FiImage, FiEdit3, FiMenu, FiChevronDown,
  FiChevronRight, FiCheck, FiVideo, FiBook,
} from "react-icons/fi";
import { MdOutlineOndemandVideo } from "react-icons/md";
import Link from "next/link";
import { toast } from "sonner";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Lesson {
  id: string;
  title: string;
  contentUrl: string;
  sectionTitle: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

function SortableLesson({
  lesson, onRemove, onTitleChange,
}: {
  lesson: Lesson;
  onRemove: (id: string) => void;
  onTitleChange: (id: string, title: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 group hover:border-slate-300 transition-all shadow-sm"
    >
      <div {...attributes} {...listeners}
        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <FiMenu size={14} />
      </div>
      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
        <MdOutlineOndemandVideo size={13} className="text-slate-500" />
      </div>
      <input
        type="text"
        value={lesson.title}
        onChange={(e) => onTitleChange(lesson.id, e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        placeholder="Lesson title..."
        className="flex-1 text-sm font-semibold text-slate-700 focus:outline-none bg-transparent placeholder:text-slate-300 placeholder:font-normal"
      />
      {lesson.contentUrl ? (
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
          Ready
        </span>
      ) : (
        <span className="text-[9px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
          Uploading
        </span>
      )}
      <button type="button" onClick={() => onRemove(lesson.id)}
        className="text-slate-200 hover:text-rose-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
      >
        <FiTrash2 size={13} />
      </button>
    </div>
  );
}

function SectionBlock({
  section, index, onRename, onRemove, onAddLesson,
  onRemoveLesson, onLessonTitleChange, onDragEnd, uploadingForSection,
}: {
  section: Section; index: number;
  onRename: (id: string, title: string) => void;
  onRemove: (id: string) => void;
  onAddLesson: (sectionId: string, file: File) => void;
  onRemoveLesson: (sectionId: string, lessonId: string) => void;
  onLessonTitleChange: (sectionId: string, lessonId: string, title: string) => void;
  onDragEnd: (sectionId: string, event: DragEndEvent) => void;
  uploadingForSection: string | null;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
        <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">
          {index + 1}
        </div>
        <input
          type="text"
          value={section.title}
          onChange={(e) => onRename(section.id, e.target.value)}
          placeholder="Section title..."
          className="flex-1 text-sm font-black uppercase italic tracking-tight text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-300 placeholder:normal-case placeholder:not-italic"
        />
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {section.lessons.length} lessons
          </span>
          <button type="button" onClick={() => onRemove(section.id)}
            className="text-slate-300 hover:text-rose-500 transition-colors p-1"
          >
            <FiTrash2 size={13} />
          </button>
          <button type="button" onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
          >
            <FiChevronDown size={14} className={`transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="p-4 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => onDragEnd(section.id, e)}>
            <SortableContext items={section.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {section.lessons.map((lesson) => (
                <SortableLesson
                  key={lesson.id}
                  lesson={lesson}
                  onRemove={(lid) => onRemoveLesson(section.id, lid)}
                  onTitleChange={(lid, title) => onLessonTitleChange(section.id, lid, title)}
                />
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
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 uppercase tracking-wider transition-colors">
                Add Lesson
              </span>
              <input type="file" hidden accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAddLesson(section.id, file);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      {[{ n: 1, label: "Course Info" }, { n: 2, label: "Curriculum" }].map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step === n ? "bg-slate-900 text-white" : step > n ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {step > n ? <FiCheck size={13} /> : n}
            </div>
            <span className={`text-[11px] font-black uppercase tracking-wider ${step === n ? "text-slate-900" : "text-slate-400"}`}>
              {label}
            </span>
          </div>
          {i < 1 && <FiChevronRight size={14} className="text-slate-300" />}
        </div>
      ))}
    </div>
  );
}

export default function CreateResourcePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [courseInfo, setCourseInfo] = useState({
    title: "", description: "", price: 0, thumbnail: "", badgeId: "",
  });
  const [sections, setSections] = useState<Section[]>([
    { id: crypto.randomUUID(), title: "Getting Started", lessons: [] },
  ]);
  const [uploadingForSection, setUploadingForSection] = useState<string | null>(null);

  const { mutate: upload, isPending: isUploading, variables } = useUploadMutation();
  const createResource = useCreateResourceMutation();

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload({ file, type: "thumbnail" }, {
      onSuccess: (res) => { setCourseInfo((p) => ({ ...p, thumbnail: res.url })); toast.success("Thumbnail uploaded!"); },
      onError: () => toast.error("Thumbnail upload failed."),
    });
  };

  const canProceedStep1 = courseInfo.title.trim() && courseInfo.description.trim() && courseInfo.thumbnail;

  const addSection = () => {
    setSections((p) => [...p, { id: crypto.randomUUID(), title: `Section ${p.length + 1}`, lessons: [] }]);
  };

  const renameSection = (id: string, title: string) =>
    setSections((p) => p.map((s) => s.id === id ? { ...s, title } : s));

  const removeSection = (id: string) =>
    setSections((p) => p.filter((s) => s.id !== id));

  const addLesson = (sectionId: string, file: File) => {
    setUploadingForSection(sectionId);
    const lessonId = crypto.randomUUID();
    upload({ file, type: "video" }, {
      onSuccess: (res) => {
        setSections((p) => p.map((s) => s.id === sectionId ? {
          ...s,
          lessons: [...s.lessons, {
            id: lessonId,
            title: file.name.replace(/\.[^/.]+$/, ""),
            contentUrl: res.url,
            sectionTitle: s.title,
          }],
        } : s));
        toast.success("Lesson uploaded!");
        setUploadingForSection(null);
      },
      onError: () => { toast.error("Video upload failed."); setUploadingForSection(null); },
    });
  };

  const removeLesson = (sectionId: string, lessonId: string) =>
    setSections((p) => p.map((s) => s.id === sectionId
      ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s));

  const lessonTitleChange = (sectionId: string, lessonId: string, title: string) =>
    setSections((p) => p.map((s) => s.id === sectionId
      ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, title } : l) } : s));

  const handleLessonDragEnd = (sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((p) => p.map((s) => {
      if (s.id !== sectionId) return s;
      const oldIdx = s.lessons.findIndex((l) => l.id === active.id);
      const newIdx = s.lessons.findIndex((l) => l.id === over.id);
      return { ...s, lessons: arrayMove(s.lessons, oldIdx, newIdx) };
    }));
  };

  const totalLessons = sections.reduce((acc, s) => acc + s.lessons.length, 0);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalLessons === 0) return toast.error("Add at least one lesson before publishing.");
    const modules = sections.flatMap((s) =>
      s.lessons.map((l) => ({ title: l.title, url: l.contentUrl, sectionTitle: s.title }))
    );
    createResource.mutate({ ...courseInfo, modules } as any, {
      onSuccess: () => { toast.success("Course published!"); router.push("/creator/dashboard"); },
      onError: (err: any) => toast.error(err.message || "Publishing failed"),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <Link href="/creator/dashboard"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 mb-8 transition-all"
        >
          <FiArrowLeft size={13} /> Back to Studio
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">
            Create <span className="text-blue-600">New Course</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Build a structured course with sections and lessons.</p>
        </div>
        <StepIndicator step={step} />

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Course Title <span className="text-rose-400">*</span>
                </label>
                <input type="text" required value={courseInfo.title}
                  className="w-full border-b-2 border-slate-100 py-3 focus:outline-none focus:border-slate-900 text-lg font-bold text-slate-900 transition-colors"
                  placeholder="e.g. Advanced Backend Architecture"
                  onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea rows={4} required value={courseInfo.description}
                  className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-300 text-sm bg-slate-50/50 rounded-lg resize-none text-slate-700 transition-colors"
                  placeholder="What will your students learn from this course?"
                  onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                  Price (NPR) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">NPR</span>
                  <input type="number" required min={0} value={courseInfo.price || ""}
                    className="w-full border border-slate-100 rounded-lg pl-14 pr-4 py-3 focus:outline-none focus:border-slate-300 font-bold text-slate-900 bg-slate-50/50 transition-colors"
                    placeholder="999"
                    onChange={(e) => setCourseInfo({ ...courseInfo, price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-4">
                Course Thumbnail <span className="text-rose-400">*</span>
              </label>
              <label className="relative flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 hover:bg-slate-50 transition-all overflow-hidden group max-w-lg">
                {courseInfo.thumbnail ? (
                  <>
                    <img src={courseInfo.thumbnail} className="w-full h-full object-cover" alt="thumbnail" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Change Thumbnail</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-300 gap-3">
                    {isUploading && variables?.type === "thumbnail"
                      ? <FiLoader className="animate-spin" size={28} />
                      : <FiImage size={28} />
                    }
                    <div className="text-center">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Upload Thumbnail</p>
                      <p className="text-[9px] text-slate-300 mt-1">Recommended: 1280×720px</p>
                    </div>
                  </div>
                )}
                <input type="file" hidden accept="image/*" onChange={handleThumbnailUpload} />
              </label>
            </div>

            <div className="flex justify-end">
              <button type="button"
                disabled={!canProceedStep1 || (isUploading && variables?.type === "thumbnail")}
                onClick={() => setStep(2)}
                className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                Continue to Curriculum <FiArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handlePublish} className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-5">
              {courseInfo.thumbnail && (
                <img src={courseInfo.thumbnail} className="w-16 h-10 object-cover rounded-lg border border-slate-200 shrink-0" alt="" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black uppercase italic tracking-tight text-slate-900 truncate">{courseInfo.title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">NPR {courseInfo.price?.toLocaleString()}</p>
              </div>
              <button type="button" onClick={() => setStep(1)}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-wider flex items-center gap-1"
              >
                <FiEdit3 size={11} /> Edit Info
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <FiBook size={14} />, label: "Sections", value: sections.length, color: "text-violet-600 bg-violet-50" },
                { icon: <FiVideo size={14} />, label: "Lessons", value: totalLessons, color: "text-blue-600 bg-blue-50" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{s.value}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {sections.map((section, i) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                  index={i}
                  onRename={renameSection}
                  onRemove={removeSection}
                  onAddLesson={addLesson}
                  onRemoveLesson={removeLesson}
                  onLessonTitleChange={lessonTitleChange}
                  onDragEnd={handleLessonDragEnd}
                  uploadingForSection={uploadingForSection}
                />
              ))}
            </div>

            <button type="button" onClick={addSection}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-4 text-[11px] font-black uppercase tracking-wider text-slate-400 hover:border-slate-400 hover:text-slate-700 hover:bg-white transition-all"
            >
              <FiPlus size={14} /> Add Section
            </button>

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => setStep(1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors tracking-wider"
              >
                <FiArrowLeft size={13} /> Back
              </button>
              <button type="submit"
                disabled={createResource.isPending || isUploading || totalLessons === 0}
                className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-lg shadow-lg hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                {createResource.isPending ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
                Publish Course
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
