import React, { useState } from "react";
import { HiCode } from "react-icons/hi";

interface EditorProps {
  onSubmit: (content: string, language: string | null) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const LANGUAGES = ["javascript", "python", "cpp", "java", "typescript", "go"];

export const DiscussionEditor = ({ onSubmit, onCancel, isLoading }: EditorProps) => {
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content, language);
    setContent("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
          <HiCode className="text-slate-500" />
          <select 
            value={language || ""} 
            onChange={(e) => setLanguage(e.target.value || null)}
            className="bg-transparent text-xs font-mono outline-none text-slate-600 cursor-pointer"
          >
            <option value="">Select Language (Optional)</option>
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang}>{lang.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Explain your approach or paste your code using ```..."
        className="w-full min-h-[120px] p-3 text-sm border border-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-y"
      />

      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !content.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-md transition-all"
        >
          {isLoading ? "Posting..." : "Post Discussion"}
        </button>
      </div>
    </div>
  );
};