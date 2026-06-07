"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useBadges } from "@/hooks/useBadges";
import { FiPlus, FiUploadCloud, FiLoader, FiTrash2, FiEdit3, FiX, FiSearch, FiAward, FiSave } from "react-icons/fi";

const fieldClass = "w-full border-2 border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium text-slate-900 bg-white outline-none focus:border-slate-900 transition-colors";
const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5";

export default function AdminBadgePage() {
  const { badges, isLoading, deleteMutation, updateMutation, createBadge } = useBadges() as any;
  const [formData, setFormData] = useState({ name: "", description: "", iconUrl: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaving = createBadge?.isPending || updateMutation?.isPending;

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("type", "badgeIcon");
    setIsUploading(true);
    try {
      const res = await api.post("/upload", form);
      if (res.data.success) {
        setFormData((p) => ({ ...p, iconUrl: res.data.url }));
        toast.success("Icon uploaded");
      }
    } catch { toast.error("Upload failed"); }
    finally { setIsUploading(false); }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", iconUrl: "" });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.iconUrl) return toast.error("Please upload a badge icon");
    if (editingId) {
      updateMutation?.mutate({ id: editingId, data: formData }, { onSuccess: resetForm });
    } else {
      createBadge?.mutate(formData, { onSuccess: resetForm });
    }
  };

  const filtered = (badges || []).filter((b: any) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
            Badges<span className="text-primary-1">.</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            Achievement library management
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Search badges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-2 border-slate-200 rounded-sm py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-slate-300 outline-none focus:border-slate-900 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-slate-100 rounded-sm p-6 sticky top-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">
              {editingId ? "Edit Badge" : "New Badge"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  className={fieldClass}
                  placeholder="e.g. Code Warrior"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  className={fieldClass + " resize-none"}
                  placeholder="How does a user earn this?"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Icon upload */}
              <div>
                <label className={labelClass}>Icon</label>
                <div className="relative aspect-square border-2 border-dashed border-slate-200 rounded-sm bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-slate-400 transition-colors">
                  {formData.iconUrl ? (
                    <>
                      <img src={formData.iconUrl} alt="preview" className="w-24 h-24 object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, iconUrl: "" })}
                        className="absolute top-2 right-2 w-6 h-6 bg-white border border-slate-200 rounded-sm flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all"
                      >
                        <FiX size={11} />
                      </button>
                    </>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2 p-6">
                      {isUploading
                        ? <FiLoader className="animate-spin text-slate-400" size={24} />
                        : <FiUploadCloud size={24} className="text-slate-300" />}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {isUploading ? "Uploading..." : "Upload SVG / PNG"}
                      </span>
                      <span className="text-[9px] text-slate-300">512×512px recommended</span>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleIconUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {editingId && (
                  <button type="button" onClick={resetForm} className="flex-1 py-2.5 border-2 border-slate-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-900 transition-all">
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 active:scale-95"
                >
                  <FiSave size={12} />
                  {isSaving ? "Saving..." : editingId ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Badge grid */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <FiLoader className="animate-spin text-slate-300" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-sm">
              <FiAward size={28} className="text-slate-200 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No badges yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((b: any) => (
                <div key={b.id} className="bg-white border-2 border-slate-100 rounded-sm p-5 flex flex-col items-center gap-3 hover:border-slate-300 transition-all group">
                  <div className="w-16 h-16 bg-slate-50 rounded-sm flex items-center justify-center p-2 group-hover:scale-105 transition-transform">
                    <img src={b.iconUrl} alt={b.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-wider truncate w-full">{b.name}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSelectedBadge(b)}
                      className="w-7 h-7 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-all"
                    >
                      <FiAward size={12} />
                    </button>
                    <button
                      onClick={() => { setEditingId(b.id); setFormData(b); }}
                      className="w-7 h-7 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-primary-1 hover:border-primary-1/40 transition-all"
                    >
                      <FiEdit3 size={12} />
                    </button>
                    <button
                      onClick={() => { if (confirm("Delete this badge?")) deleteMutation?.mutate(b.id); }}
                      className="w-7 h-7 border-2 border-slate-200 rounded-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => e.currentTarget === e.target && setSelectedBadge(null)}>
          <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl border border-slate-200 p-8 text-center animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setSelectedBadge(null)} className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
              <FiX size={14} />
            </button>
            <div className="w-32 h-32 bg-slate-50 border-2 border-slate-100 rounded-sm flex items-center justify-center mx-auto mb-5 p-4">
              <img src={selectedBadge.iconUrl} alt={selectedBadge.name} className="w-full h-full object-contain" />
            </div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900">{selectedBadge.name}</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{selectedBadge.description}</p>
            <div className="mt-5 pt-5 border-t border-slate-100">
              <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest bg-primary-1/10 px-3 py-1.5 rounded-sm">
                CodeArena Official Badge
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
