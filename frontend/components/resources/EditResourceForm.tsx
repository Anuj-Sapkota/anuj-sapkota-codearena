// components/creator/EditResourceForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadMutation } from "@/hooks/useUpload";
import { useUpdateResourceMutation } from "@/hooks/useResource";
import { FiPlus, FiLoader, FiSave, FiImage } from "react-icons/fi";
import { toast } from "sonner";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableModule } from "./SortableModule";

interface Module { title: string; url: string; type: string; }

export function EditResourceForm({ initialData, resourceId }: { initialData: any; resourceId: string }) {
  const router = useRouter();
  const updateResource = useUpdateResourceMutation(resourceId);
  const sensors = useSensors(useSensor(PointerSensor));

  const [series, setSeries] = useState({
    title: initialData.title,
    description: initialData.description,
    price: initialData.price,
    thumbnail: initialData.previewUrl,
    modules: initialData.modules.map((m: any) => ({ title: m.title, url: m.contentUrl, type: "video" })) as Module[],
  });

  const { mutate: upload, isPending: isUploading } = useUploadMutation();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    upload({ file, type }, {
      onSuccess: (res) => {
        if (type === "thumbnail") setSeries(p => ({ ...p, thumbnail: res.url }));
        else setSeries(p => ({ ...p, modules: [...p.modules, { title: file.name.split('.')[0], url: res.url, type: "video" }] }));
        toast.success("Uploaded!");
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSeries((prev) => {
        const oldIdx = prev.modules.findIndex((m: any) => m.url === active.id);
        const newIdx = prev.modules.findIndex((m: any) => m.url === over?.id);
        return { ...prev, modules: arrayMove(prev.modules, oldIdx, newIdx) };
      });
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); updateResource.mutate(series, { onSuccess: () => router.push("/creator/dashboard") }); }} className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4 bg-white p-6 border">
          <input className="w-full border-b font-bold text-xl p-2 outline-none" value={series.title} onChange={e => setSeries({...series, title: e.target.value})} />
          <textarea rows={4} className="w-full border p-4 text-sm bg-slate-50" value={series.description} onChange={e => setSeries({...series, description: e.target.value})} />
        </div>
        <div className="bg-white p-6 border space-y-4">
          <input type="number" className="w-full border-b font-bold p-2" value={series.price} onChange={e => setSeries({...series, price: Number(e.target.value)})} />
          <label className="block aspect-video border-2 border-dashed cursor-pointer relative overflow-hidden">
             <img src={series.thumbnail} className="w-full h-full object-cover" />
             <input type="file" hidden onChange={e => handleFile(e, "thumbnail")} />
          </label>
        </div>
      </div>

      <div className="bg-white p-6 border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={series.modules.map(m => m.url)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {series.modules.map((m, i) => (
                <SortableModule key={m.url} m={m} i={i} 
                  updateModuleTitle={(idx: number, val: string) => {
                    const next = [...series.modules]; next[idx].title = val; setSeries({...series, modules: next});
                  }}
                  removeModule={(idx: number) => setSeries(p => ({ ...p, modules: p.modules.filter((_, i) => i !== idx) }))}
                />
              ))}
              <label className="aspect-video border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50">
                <FiPlus size={24} />
                <input type="file" hidden onChange={e => handleFile(e, "video")} disabled={isUploading} />
              </label>
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <button disabled={updateResource.isPending} className="fixed bottom-8 right-8 bg-slate-900 text-white px-10 py-4 flex items-center gap-3 shadow-xl">
        {updateResource.isPending ? <FiLoader className="animate-spin" /> : <><FiSave /> Save Changes</>}
      </button>
    </form>
  );
}