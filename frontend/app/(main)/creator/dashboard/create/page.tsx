"use client";

import { useState } from "react";
import { useUploadMutation } from "@/hooks/useUpload";
import { useCreateResourceMutation } from "@/hooks/useResource";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiPlus,
  FiLoader,
  FiCheck,
  FiSave,
  FiTrash2,
  FiImage,
  FiEdit3,
  FiMenu,
} from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- 1. SORTABLE MODULE COMPONENT ---
function SortableModule({ m, i, updateModuleTitle, removeModule }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: m.contentUrl }); // Using contentUrl as the unique identifier

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm"
    >
      <div className="relative aspect-video bg-slate-900">
        <video
          src={m.contentUrl || m.localPreview}
          className="w-full h-full object-cover"
          controls
          // 🛠️ STOP PROPAGATION: Allows clicking play/pause without starting a drag
          onPointerDown={(e) => e.stopPropagation()}
        />

        {/* DRAG HANDLE: The ONLY part that triggers movement */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 p-2 bg-white/90 rounded-sm cursor-grab active:cursor-grabbing hover:bg-white transition-colors shadow-sm z-10"
        >
          <FiMenu className="text-slate-900" size={14} />
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <FiEdit3 className="text-slate-300" size={12} />
          <input
            type="text"
            className="flex-1 text-[11px] font-black uppercase italic focus:outline-none focus:text-slate-900"
            value={m.title}
            // 🛠️ STOP PROPAGATION: Allows focusing the input without starting a drag
            onPointerDown={(e) => e.stopPropagation()}
            onChange={(e) => updateModuleTitle(i, e.target.value)}
            placeholder="Enter Chapter Title"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiCheck className="text-emerald-500" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
              Order: {i + 1}
            </span>
          </div>
          <button
            type="button"
            onClick={() => removeModule(i)}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. MAIN PAGE COMPONENT ---
export default function CreateResourcePage() {
  const router = useRouter();
  const [series, setSeries] = useState({
    title: "",
    description: "",
    price: 0,
    thumbnail: "",
    modules: [] as {
      title: string;
      contentUrl: string; // Updated to match Prisma
      type: string;
      localPreview?: string;
    }[],
  });

  // 🛠️ ACTIVATION CONSTRAINT: Prevents accidental drags when just clicking
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required to start a drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const {
    mutate: upload,
    isPending: isUploading,
    progress,
    variables,
  } = useUploadMutation();

  const createResource = useCreateResourceMutation();

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);

    upload(
      { file, type },
      {
        onSuccess: (res) => {
          if (type === "thumbnail") {
            setSeries((prev) => ({ ...prev, thumbnail: res.url }));
          } else {
            setSeries((prev) => ({
              ...prev,
              modules: [
                ...prev.modules,
                {
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  contentUrl: res.url, // Corrected key
                  type: "video",
                  localPreview,
                },
              ],
            }));
          }
          toast.success(
            `${type === "video" ? "Chapter" : "Thumbnail"} uploaded!`,
          );
        },
        onError: () => toast.error("Upload failed. Please try again."),
      },
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSeries((prev) => {
        const oldIndex = prev.modules.findIndex(
          (m) => m.contentUrl === active.id,
        );
        const newIndex = prev.modules.findIndex(
          (m) => m.contentUrl === over?.id,
        );
        return {
          ...prev,
          modules: arrayMove(prev.modules, oldIndex, newIndex),
        };
      });
    }
  };

  const updateModuleTitle = (index: number, newTitle: string) => {
    setSeries((prev) => ({
      ...prev,
      modules: prev.modules.map((m, i) =>
        i === index ? { ...m, title: newTitle } : m,
      ),
    }));
  };

  const removeModule = (index: number) => {
    setSeries((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!series.title || !series.thumbnail || series.modules.length === 0) {
      return toast.error("Complete all details and upload at least one video.");
    }

    createResource.mutate(series, {
      onSuccess: () => {
        toast.success("Masterclass published to CodeArena!");
        router.push("/creator/dashboard");
      },
      onError: (err: any) => toast.error(err.message || "Publishing failed"),
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <Link
        href="/creator/dashboard"
        className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 mb-8 transition-all"
      >
        <FiArrowLeft /> Back to Studio
      </Link>

      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">
          Build Series
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Create a professional masterclass by grouping your videos.
        </p>
      </div>

      <form onSubmit={handlePublish} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Resource Title
              </label>
              <input
                type="text"
                required
                className="w-full border-b-2 border-slate-100 py-3 focus:outline-none focus:border-slate-900 text-lg font-bold"
                placeholder="e.g. Advanced Backend Architecture"
                onChange={(e) =>
                  setSeries({ ...series, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Description
              </label>
              <textarea
                rows={5}
                required
                className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-900 text-sm bg-slate-50/50 rounded-sm"
                placeholder="What will your students learn?"
                onChange={(e) =>
                  setSeries({ ...series, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Price (USD)
              </label>
              <input
                type="number"
                required
                className="w-full border-b-2 border-slate-100 py-3 focus:outline-none focus:border-slate-900 font-bold"
                placeholder="29.99"
                onChange={(e) =>
                  setSeries({ ...series, price: Number(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Cover Art
              </label>
              <label className="relative flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-100 rounded-sm cursor-pointer hover:bg-slate-50 transition-all overflow-hidden group">
                {series.thumbnail ? (
                  <img
                    src={series.thumbnail}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    {isUploading && variables?.type === "thumbnail" ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiImage size={24} />
                    )}
                    <span className="text-[9px] font-black mt-2 uppercase">
                      Upload Thumbnail
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFile(e, "thumbnail")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* CURRICULUM SECTION */}
        <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Course Curriculum
            </h3>
            <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-3 py-1 italic">
              {series.modules.length} Modules Uploaded
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={series.modules.map((m) => m.contentUrl)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {series.modules.map((m, i) => (
                  <SortableModule
                    key={m.contentUrl}
                    m={m}
                    i={i}
                    updateModuleTitle={updateModuleTitle}
                    removeModule={removeModule}
                  />
                ))}

                {isUploading && variables?.type === "video" && (
                  <div className="aspect-video border-2 border-slate-900 border-dashed rounded-sm bg-slate-50 flex flex-col items-center justify-center p-8 animate-pulse">
                    <FiLoader
                      className="animate-spin text-slate-900 mb-4"
                      size={28}
                    />
                    <span className="text-[11px] font-black uppercase">
                      Processing: {progress}%
                    </span>
                  </div>
                )}

                {!isUploading && (
                  <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-200 rounded-sm cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-all">
                    <FiPlus size={32} className="text-slate-300" />
                    <span className="text-[10px] font-black mt-3 uppercase">
                      Add Chapter
                    </span>
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={(e) => handleFile(e, "video")}
                    />
                  </label>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-end sticky bottom-8 z-20">
          <button
            type="submit"
            disabled={createResource.isPending || isUploading}
            className="px-20 py-7 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-slate-800 disabled:opacity-20 transition-all flex items-center gap-6"
          >
            {createResource.isPending ? (
              <FiLoader className="animate-spin" />
            ) : (
              <>
                <FiSave /> Publish Masterclass
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
