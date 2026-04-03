"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useBadges } from "@/hooks/useBadges";
import {
  Award,
  Loader2,
  UploadCloud,
  Plus,
  Trash2,
  Eye,
  Edit3,
  X,
  Search,
  Sparkles,
} from "lucide-react";

export default function AdminBadgePage() {
  // Assuming createBadge is now part of your useBadges hook as discussed
  const { badges, isLoading, deleteBadge, updateBadge, createBadge } =
    useBadges();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setFormData((prev) => ({ ...prev, iconUrl: res.data.url }));
        toast.success("Asset uploaded to cloud");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", iconUrl: "" });
    setEditingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.iconUrl) return toast.error("Please upload a badge icon");

    if (editingId) {
      updateBadge.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => resetForm(),
        },
      );
    } else {
      // Logic fix: Using createBadge from hook to trigger auto-refresh
      createBadge.mutate(formData, {
        onSuccess: () => resetForm(),
      });
    }
  };

  const filteredBadges =
    badges?.filter((b: any) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-emerald-100">
      <div className="max-w-[1400px] mx-auto p-6 md:p-10 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Sparkles size={14} /> Admin Control
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              Badge <span className="text-emerald-500">Factory</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Create and manage official CodeArena achievements.
            </p>
          </div>
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Creator Form */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sticky top-10">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Plus size={18} className="text-emerald-500" />
                {editingId ? "Edit Achievement" : "Mint New Badge"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                      Badge Name
                    </label>
                    <input
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all mt-1"
                      placeholder="e.g., Code Warrior"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                      Requirement Description
                    </label>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all mt-1 resize-none"
                      placeholder="How does a user earn this?"
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center transition-all hover:bg-slate-50 hover:border-emerald-300 group overflow-hidden">
                    {formData.iconUrl ? (
                      <div className="relative w-full h-full p-8 flex items-center justify-center animate-in fade-in zoom-in-95">
                        <img
                          src={formData.iconUrl}
                          className="max-w-full max-h-full object-contain drop-shadow-2xl"
                          alt="Preview"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, iconUrl: "" })
                          }
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-rose-500 hover:scale-110 transition-transform"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6">
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <UploadCloud className="text-emerald-500" size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          Upload SVG/PNG
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Recommended: 512x512px
                        </span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          hidden
                          onChange={handleIconUpload}
                          accept="image/*"
                        />
                      </label>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
                        <Loader2
                          className="animate-spin text-emerald-500 mb-2"
                          size={32}
                        />
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                          Uploading
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  disabled={
                    isUploading ||
                    createBadge?.isPending ||
                    updateBadge?.isPending
                  }
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-50 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
                >
                  {createBadge?.isPending || updateBadge?.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </div>
                  ) : editingId ? (
                    "Update Asset"
                  ) : (
                    "Mint Achievement"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel Editor
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Library Grid */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Digital Asset Library
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-500">
                {filteredBadges.length} Total
              </span>
            </div>

            {isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs">
                  Synchronizing Library...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBadges.map((b: any) => (
                  <div
                    key={b.id}
                    className="group bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center gap-4 hover:border-emerald-200 hover:shadow-[0_20px_40px_rgba(16,185,129,0.08)] transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="z-10 w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-500 group-hover:bg-white group-hover:shadow-sm">
                      <img
                        src={b.iconUrl}
                        className="max-w-full max-h-full object-contain"
                        alt={b.name}
                      />
                    </div>

                    <div className="z-10 text-center">
                      <p className="text-[11px] font-black uppercase tracking-wider text-slate-900 truncate w-full px-2">
                        {b.name}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                        Official Asset
                      </p>
                    </div>

                    <div className="z-10 flex gap-2 mt-2">
                      <button
                        onClick={() => setSelectedBadge(b)}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition-all"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(b.id);
                          setFormData(b);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-500 transition-all"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this badge?"))
                            deleteBadge.mutate(b.id);
                        }}
                        className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern View Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] max-w-sm w-full p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-48 h-48 bg-gradient-to-b from-slate-50 to-white rounded-[32px] flex items-center justify-center p-10 shadow-inner mb-8 border border-slate-100">
                <img
                  src={selectedBadge.iconUrl}
                  className="max-w-full max-h-full object-contain drop-shadow-xl"
                  alt="Badge"
                />
              </div>
              <h2 className="text-3xl font-black uppercase text-slate-900 tracking-tight">
                {selectedBadge.name}
              </h2>
              <p className="text-sm text-slate-500 mt-4 leading-relaxed font-medium">
                {selectedBadge.description}
              </p>

              <div className="w-full h-[1px] bg-slate-100 my-8" />

              <div className="bg-emerald-50/50 border border-emerald-100 text-emerald-600 text-[10px] font-black py-3 px-6 rounded-2xl uppercase tracking-[0.2em]">
                CodeArena Authenticated
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
