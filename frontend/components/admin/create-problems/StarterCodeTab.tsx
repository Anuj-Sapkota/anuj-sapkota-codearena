import Editor from "@monaco-editor/react";
import { useState } from "react";
import { FormLabel } from "@/components/ui/Form";
import { CreateProblemDTO, TabProps } from "@/types/problem.types";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
] as const;

type LangId = (typeof LANGUAGES)[number]["id"];

export default function StarterCodeTab({ formData, setFormData }: TabProps) {
  const [activeLang, setActiveLang] = useState<LangId>("javascript");

  // Safety check: ensure starterCode is an object
  const starterCodeMap = (formData.starterCode as Record<string, string>) || {};
  const currentCode = starterCodeMap[activeLang] || "";

  const handleEditorChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      starterCode: {
        ...prev.starterCode,
        [activeLang]: value || "",
      },
    }));
  };

  return (
    <div className="h-[65vh] flex flex-col space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <FormLabel>Language_Templates (Starter Code)</FormLabel>
        
        {/* Language Selection Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1 border border-gray-200">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setActiveLang(lang.id)}
              className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md transition-all cursor-pointer ${
                activeLang === lang.id
                  ? "bg-white text-primary-1 shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 border-2 border-gray-500 rounded-md overflow-hidden shadow-inner bg-[#1e1e1e] flex flex-col">
        {/* Editor Internal Header */}
        <div className="bg-[#252526] px-4 py-2 border-b border-white/5 flex justify-between items-center">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
            Buffer: {activeLang}_template.raw
          </span>
          <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest">
            {activeLang === "cpp" ? "cpp" : activeLang} engine active
          </span>
        </div>

        <div className="flex-1">
          <Editor
            height="100%"
            language={activeLang === "cpp" ? "cpp" : activeLang}
            theme="vs-dark"
            value={currentCode}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 20 },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              fontFamily: "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
            }}
          />
        </div>
      </div>
    </div>
  );
}