import Editor from "@monaco-editor/react";
import { useState } from "react";
import { TabProps } from "@/types/problem.types";

const LANGUAGES = [
  { id: "javascript", label: "JS" },
  { id: "python",     label: "PY" },
  { id: "java",       label: "Java" },
  { id: "cpp",        label: "C++" },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];

export default function StarterCodeTab({ formData, setFormData }: TabProps) {
  const [activeLang, setActiveLang] = useState<LangId>("javascript");
  const starterCodeMap = (formData.starterCode as Record<string, string>) || {};
  const currentCode = starterCodeMap[activeLang] || "";

  const handleChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      starterCode: { ...prev.starterCode, [activeLang]: value || "" },
    }));
  };

  return (
    <div className="h-[58vh] flex flex-col gap-3 animate-in fade-in duration-200">
      {/* Language tabs */}
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Starter Code Templates
        </p>
        <div className="flex bg-slate-100 p-0.5 rounded-sm gap-0.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setActiveLang(lang.id)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all ${
                activeLang === lang.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 rounded-sm overflow-hidden border-2 border-slate-200">
        <div className="bg-[#1e1e1e] px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500">
            {activeLang === "cpp" ? "solution.cpp" : activeLang === "python" ? "solution.py" : activeLang === "java" ? "Solution.java" : "solution.js"}
          </span>
          <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest">{activeLang}</span>
        </div>
        <Editor
          height="100%"
          language={activeLang}
          theme="vs-dark"
          value={currentCode}
          onChange={handleChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            padding: { top: 16 },
            automaticLayout: true,
            scrollBeyondLastLine: false,
            fontFamily: "JetBrains Mono, Fira Code, monospace",
          }}
        />
      </div>
    </div>
  );
}
