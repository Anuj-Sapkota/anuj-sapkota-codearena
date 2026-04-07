"use client";

import { useState } from "react";
import { useUploadMutation } from "@/hooks/useUpload";
import {
  useCreateResourceMutation,
  useUpdateResourceMutation,
} from "@/hooks/useResource";
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

interface Module { title: string; url: string; type: string; }
function SortableModule({ m, i, updateModuleTitle, removeModule }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: m.url });

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
        <video src={m.url} className="w-full h-full object-cover opacity-80" />
        {/* Drag Handle - Keep listeners here so the whole card isn't draggable */}
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
            className="flex-1 text-[11px] font-black uppercase italic focus:outline-none focus:text-primary-1"
            value={m.title}
            onChange={(e) => updateModuleTitle(i, e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
            Chapter {i + 1}
          </span>

          {/* 🚀 THE FIX: Stop propagation so DND doesn't intercept the click */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeModule(i);
            }}
            className="p-2 text-slate-300 hover:text-rose-500 transition-colors z-20 relative"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Form Component ---
interface ResourceFormProps {
  initialData?: any;
  resourceId?: string;
}

export default function ResourceForm({
  initialData,
  resourceId,
}: ResourceFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [series, setSeries] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    thumbnail: initialData?.previewUrl || "",
    modules:
      initialData?.modules?.map((m: any) => ({
        title: m.title,
        url: m.contentUrl,
        type: "video",
      })) as Module[] || [],
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
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

  const createMutation = useCreateResourceMutation();
  const updateMutation = useUpdateResourceMutation(resourceId || "");

  const handleFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "thumbnail" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload(
      { file, type },
      {
        onSuccess: (res) => {
          if (type === "thumbnail")
            setSeries((p) => ({ ...p, thumbnail: res.url }));
          else
            setSeries((p) => ({
              ...p,
              modules: [
                ...p.modules,
                {
                  title: file.name.replace(/\.[^/.]+$/, ""),
                  url: res.url,
                  type: "video",
                },
              ],
            }));
          toast.success("Upload successful");
        },
      },
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSeries((prev) => {
        const oldIndex = prev.modules.findIndex((m) => m.url === active.id);
        const newIndex = prev.modules.findIndex((m) => m.url === over?.id);
        return {
          ...prev,
          modules: arrayMove(prev.modules, oldIndex, newIndex),
        };
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mutation = isEdit ? updateMutation : createMutation;
    mutation.mutate(series, {
      onSuccess: () => {
        toast.success(isEdit ? "Changes synced!" : "Series published!");
        router.push("/creator/dashboard");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
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
              value={series.title}
              onChange={(e) => setSeries({ ...series, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Description
            </label>
            <textarea
              rows={5}
              required
              className="w-full border border-slate-100 p-4 focus:outline-none focus:border-slate-900 text-sm bg-slate-50/50"
              value={series.description}
              onChange={(e) =>
                setSeries({ ...series, description: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-6 bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Price (NPR)
            </label>
            <input
              type="number"
              className="w-full border-b-2 border-slate-100 py-3 focus:outline-none focus:border-slate-900 font-bold"
              value={series.price}
              onChange={(e) =>
                setSeries({ ...series, price: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Cover Art
            </label>
            <label className="relative flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-100 rounded-sm cursor-pointer overflow-hidden group">
              {series.thumbnail ? (
                <img
                  src={series.thumbnail}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all"
                />
              ) : (
                <FiImage className="text-slate-300" size={24} />
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase">
                Change Image
              </div>
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

      <div className="bg-white border border-slate-200 p-8 rounded-sm shadow-sm">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8">
          Course Curriculum
        </h3>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={series.modules.map((m) => m.url)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {series.modules.map((m, i) => (
                <SortableModule
                  key={m.url}
                  m={m}
                  i={i}
                  updateModuleTitle={(idx: number, val: string) => {
                    const newMods = [...series.modules];
                    newMods[idx].title = val;
                    setSeries({ ...series, modules: newMods });
                  }}
                  removeModule={(idx: number) =>
                    setSeries((p) => ({
                      ...p,
                      modules: p.modules.filter((_, i) => i !== idx),
                    }))
                  }
                />
              ))}
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-slate-200 rounded-sm cursor-pointer hover:border-slate-900 transition-all">
                {isUploading && variables?.type === "video" ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <FiPlus size={32} />
                )}
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={(e) => handleFile(e, "video")}
                  disabled={isUploading}
                />
              </label>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="flex justify-end sticky bottom-8 z-20">
        <button
          type="submit"
          disabled={
            isUploading || createMutation.isPending || updateMutation.isPending
          }
          className="px-20 py-7 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-600 transition-all flex items-center gap-6"
        >
          {createMutation.isPending || updateMutation.isPending ? (
            <FiLoader className="animate-spin" />
          ) : (
            <>
              <FiSave /> {isEdit ? "Update Series" : "Publish Series"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
