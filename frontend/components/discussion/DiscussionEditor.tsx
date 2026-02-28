"use client";
import React, { useState } from "react";
import { HiCode } from "react-icons/hi";
import { MdClose, MdSend } from "react-icons/md";

interface EditorProps {
  onSubmit: (content: string, language: string | null) => void;
  onCancel: () => void;
  isLoading: boolean;
  initialContent?: string;
  initialLanguage?: string | null;
  buttonLabel?: string;
}

const LANGUAGES = ["javascript", "python", "cpp", "java", "typescript", "go"];

export const DiscussionEditor = ({ 
  onSubmit, 
  onCancel, 
  isLoading, 
  initialContent = "", 
  initialLanguage = null,
  buttonLabel = "Post Discussion" 
}: EditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [language, setLanguage] = useState<string | null>(initialLanguage);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content, language);
  };

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      
      {/* Label matching your FormLabel style */}
      <div className="flex flex-col gap-3 mb-4">
        <label className="text-[10px] font-black text-emerald-900/60 ml-1 tracking-[0.2em] uppercase">
          Select_Context
        </label>
        <div className="flex items-center gap-2 w-fit px-4 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl transition-all hover:border-emerald-500/30">
          <HiCode className="text-slate-400 text-lg" />
          <select 
            value={language || ""} 
            onChange={(e) => setLanguage(e.target.value || null)}
            className="bg-transparent text-xs font-black uppercase tracking-widest outline-none text-slate-700 cursor-pointer"
          >
            <option value="">No_Language</option>
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Textarea matching FormTextarea style */}
      <div className="flex flex-col gap-3">
        <label className="text-[10px] font-black text-emerald-900/60 ml-1 tracking-[0.2em] uppercase">
          Discussion_Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="TYPE_YOUR_APPROACH_OR_PASTE_CODE_HERE..."
          className="w-full min-h-[180px] border-2 border-slate-200 rounded-2xl p-5 bg-white text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all resize-y shadow-sm font-medium text-sm"
        />
      </div>

      {/* Buttons matching FormButton style */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          type="button"
          className="flex items-center gap-2 px-6 py-3 text-[10px]  cursor-pointer font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          <MdClose className="text-lg" /> Cancel_Action
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !content.trim()}
          className="group relative bg-slate-800 text-white px-10 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:shadow-2xl hover:shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? "Processing..." : (
              <>
                {buttonLabel.replace(" ", "_")} <MdSend className="text-base" />
              </>
            )}
          </span>
          
          {/* Emerald slide-up overlay on hover */}
          {!isLoading && (
            <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};