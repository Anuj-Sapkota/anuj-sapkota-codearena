// components/creator/SortableModule.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMenu, FiEdit3, FiTrash2 } from "react-icons/fi";

export function SortableModule({ m, i, updateModuleTitle, removeModule }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group border border-slate-200 rounded-sm bg-white overflow-hidden shadow-sm">
      <div className="relative aspect-video bg-slate-900">
        <video src={m.localPreview || m.url} className="w-full h-full object-cover opacity-80" />
        <div {...attributes} {...listeners} className="absolute top-2 right-2 p-2 bg-white/90 rounded-sm cursor-grab active:cursor-grabbing hover:bg-white z-10">
          <FiMenu className="text-slate-900" size={14} />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <FiEdit3 className="text-slate-300" size={12} />
          <input 
            type="text" 
            className="flex-1 text-[11px] font-black uppercase italic focus:outline-none" 
            value={m.title} 
            onChange={(e) => updateModuleTitle(i, e.target.value)} 
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold text-slate-400 uppercase">Chapter {i + 1}</span>
          <button type="button" onClick={() => removeModule(i)} className="text-slate-300 hover:text-rose-500"><FiTrash2 size={16} /></button>
        </div>
      </div>
    </div>
  );
}